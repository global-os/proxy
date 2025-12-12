import { Hono, MiddlewareHandler } from 'hono';

// Define context types for TypeScript
type Env = {
  Variables: {
    cookies: Record<string, string>;
    targetHost: string;
  };
};

const app = new Hono<Env>();

const DEFAULT_HOST = 'news.ycombinator.com';
const PHILIP_HOST = 'google.com';

// Middleware: Parse cookies from header
const parseCookies: MiddlewareHandler<Env>  = async (c, next) => {
  const cookies: Record<string, string> = {};
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
const selectTargetHost: MiddlewareHandler<Env> = async (c, next) => {
  const cookies = c.get('cookies');
  const targetHost = cookies.user === 'philip' ? PHILIP_HOST : DEFAULT_HOST;
  
  c.set('targetHost', targetHost);
  await next();
};

// Middleware: Log the proxied request
const logRequest: MiddlewareHandler<Env> = async (c, next) => {
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
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return c.text('Proxy error occurred', 500);
  }
});

export default app;

// For Node.js server
// server.js or add below to same file
/*
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
*/