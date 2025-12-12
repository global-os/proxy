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
const parseCookies: MiddlewareHandler<Env> = async (c, next) => {
  const cookies: Record<string, string> = {};
  const cookieHeader = c.req.header('cookie');
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[key] = value;
      }
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
    // Build clean headers
    const requestHeaders: Record<string, string> = {};
    
    // Copy only safe headers
    const safeHeaders = [
      'accept',
      'accept-language',
      'accept-encoding',
      'user-agent',
      'referer',
      'cache-control',
      'cookie',  // Forward cookies to target
      'content-type',  // Important for POST requests
    ];
    
    c.req.raw.headers.forEach((value, key) => {
      // if (safeHeaders.includes(key.toLowerCase())) {
        requestHeaders[key] = value;
      // }
    });
    
    // Set the correct host
    requestHeaders['host'] = targetHost;
    
    // Handle request body for POST/PUT/PATCH
    const hasBody = c.req.method !== 'GET' && c.req.method !== 'HEAD';
    
    const fetchOptions: RequestInit = {
      method: c.req.method,
      headers: requestHeaders,
      redirect: 'manual',

      //error" | "follow" | "manual";
    };
    
    if (hasBody) {
      // Read the body as an ArrayBuffer instead of streaming
      console.log(await c.req.text());
      const bodyData = await c.req.arrayBuffer();
      console.log('i have body ', bodyData.toString())
      if (bodyData.byteLength > 0) {
        fetchOptions.body = bodyData;
      }
    }

    console.log('fetch ' + c.req.method + ' response:');
    
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log(response.headers);
    
    // Node's fetch automatically decompresses, so remove encoding headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length'); // Wrong after decompression
    
    // Remove security headers that break proxying
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('content-security-policy-report-only');
    responseHeaders.delete('x-frame-options');
    responseHeaders.delete('strict-transport-security');
    
    // Handle set-cookie specially (it can have multiple values)
    // Note: For cookies to work across domains, we'd need to rewrite them
    
    console.log('Set-Cookie headers:', response.headers.getSetCookie?.() || 'none');

    const init = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };
    console.log(init);
    
    return new Response(response.body, init);
  } catch (error) {
    console.error('Proxy error:', error);
    return c.text('Proxy error occurred', 500);
  }
});

export default app;

// Start the server
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3000,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
  console.log(`Set Cookie: user=philip to proxy to ${PHILIP_HOST}`);
});