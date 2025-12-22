import { Hono } from 'hono'
import { getPath } from 'hono/utils/url'
import { serve } from '@hono/node-server'
// import session from 'express-session'

import { testConnection } from './db'
import * as middleware from './middleware'
import { Env } from './types'
import { replaceDomainInHTML } from './replace'
import { pathFromHostnameAndPath } from './utils'
import authRoutes from './routes/auth'
import { useState } from 'hono/jsx'

const app = new Hono<Env>({
  getPath(request, options) {
    const path = getPath(request)
    const { hostname } = new URL(request.url)

    const x = pathFromHostnameAndPath(hostname, path)
    console.log('app x', x)
    return x
  },
})

app.use(
  '/instance/*',
  middleware.provideDb,
  middleware.parseCookies,
  middleware.selectTargetHost,
  middleware.logRequest
)

app.basePath("/app/auth").route("/", authRoutes);

app.get('/app/*', async (c) => {
  return c.html(
    <html>
      <body>
        <h1>Hello {c.req.query('name')}</h1>
        <Foo />
      </body>
    </html>
  )
})

const Foo = () => {
  const [a, setA] = useState("foo");
  return <div>
    {a}
    <button onClick={() => {setA("bar")}}>check</button>
  </div>

}

app.all('/instance/*', async (c) => {
  const targetHost = c.get('targetHost')
  const url = new URL(c.req.url)
  const host = url.host

  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`

  const db = c.get('db')

  try {
    // Build clean headers
    const requestHeaders: Record<string, string> = {}

    // Copy only safe headers
    const safeHeaders = [
      'accept',
      'accept-language',
      'accept-encoding',
      'user-agent',
      'referer',
      'cache-control',
      'cookie', // Forward cookies to target
      'content-type', // Important for POST requests
    ]

    c.req.raw.headers.forEach((value, key) => {
      // if (safeHeaders.includes(key.toLowerCase())) {
      requestHeaders[key] = value
      // }
    })

    // Set the correct host
    requestHeaders['host'] = targetHost

    // Handle request body for POST/PUT/PATCH
    const hasBody = c.req.method !== 'GET' && c.req.method !== 'HEAD'

    const fetchOptions: RequestInit = {
      method: c.req.method,
      headers: requestHeaders,
      redirect: 'manual',
    }

    if (hasBody) {
      // Read the body as an ArrayBuffer instead of streaming
      const bodyData = await c.req.arrayBuffer()

      if (bodyData.byteLength > 0) {
        fetchOptions.body = bodyData
      }
    }

    const response = await fetch(targetUrl, fetchOptions)

    // Node's fetch automatically decompresses, so remove encoding headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length') // Wrong after decompression

    // Remove security headers that break proxying
    responseHeaders.delete('content-security-policy')
    responseHeaders.delete('content-security-policy-report-only')
    responseHeaders.delete('x-frame-options')
    responseHeaders.delete('strict-transport-security')

    // Handle set-cookie specially (it can have multiple values)
    // Note: For cookies to work across domains, we'd need to rewrite them

    console.log(
      'Set-Cookie headers:',
      response.headers.getSetCookie?.() || 'none'
    )

    const init = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    }

    let nextResponse = new Response(response.body, init)

    // If you have a Response object
    if (response.body) {
      const text = await response.text()
      const transformed = replaceDomainInHTML(
        text,
        targetHost,
        host,
        c.get('isLocal')
      )

      // Create new response with transformed body
      nextResponse = new Response(transformed, {
        ...init,
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return c.text('Proxy error occurred', 500)
  }
})

async function main() {
  await testConnection()

  serve(
    {
      fetch: app.fetch,
      port: Number(process.env.PORT) || 3000,
    },
    (info) => {
      console.log(`Server running on http://localhost:${info.port}`)
    }
  )
}

main()

export default app
