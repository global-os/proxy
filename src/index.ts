import { Hono, MiddlewareHandler } from 'hono';
import { serve } from '@hono/node-server';

import { testConnection } from './db';
import * as schema from './db/schema';
import * as middleware from './middleware'
import { eq } from 'drizzle-orm';
import { Env } from './types';

const app = new Hono<Env>();

app.use(
  '*',
  middleware.provideDb,
  middleware.parseCookies,
  middleware.selectTargetHost,
  middleware.logRequest
);

app.all('*', async (c) => {
  const targetHost = c.get('targetHost');
  const url = new URL(c.req.url);
  const host = url.host;

  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  const db = c.get('db');

  const userDomains = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.user_id, 123));

  console.log('user domains', userDomains)

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

async function main() {
  await testConnection();

  serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  });
}

main()

export default app;
