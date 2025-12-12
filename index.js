
const { Hono } = require('hono');

const app = new Hono();

const DEFAULT_HOST = 'news.ycombinator.com';
const PHILIP_HOST = 'google.com';

// Middleware: Parse cookies from header
const parseCookies = async (c, next) => {
  const cookies = {};
  const cookieHeader = c.req.header('cookie');
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      cookies[key] = value;
    });
  }
  
  c.set('cookies', cookies);
  await next();
};

// Middleware: Select target host based on user cookie
const selectTargetHost = async (c, next) => {
  const cookies = c.get('cookies');
  const targetHost = cookies.user === 'philip' ? PHILIP_HOST : DEFAULT_HOST;
  
  c.set('targetHost', targetHost);
  await next();
};

// Middleware: Log the proxied request
const logRequest = async (c, next) => {
  const targetHost = c.get('targetHost');
  console.log(`Proxying: ${c.req.path} -> https://${targetHost}${c.req.path}`);
  await next();
};

// Compose all middleware
app.use('*', parseCookies, selectTargetHost, logRequest);

// Main proxy handler
app.all('*', async (c) => {
  const targetHost = c.get('targetHost');
  const url = new URL(c.req.url);
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });
    
    // Stream the response back (Workers handles this perfectly)
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return c.text('Proxy error occurred', 500);
  }
});
