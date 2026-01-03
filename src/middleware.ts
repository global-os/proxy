import { MiddlewareHandler } from 'hono'
import { db } from './db/index.js'
import { Env } from './types'
import * as schema from './db/schema.js'
import { eq } from 'drizzle-orm'
import { pathFromHostnameAndPath } from './utils'

export const provideDb: MiddlewareHandler<Env> = async (c, next) => {
  c.set('db', db)
  await next()
}

// Middleware: Parse cookies from header
export const parseCookies: MiddlewareHandler<Env> = async (c, next) => {
  const cookies: Record<string, string> = {}
  const cookieHeader = c.req.header('cookie')

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        cookies[key] = value
      }
    })
  }

  c.set('cookies', cookies)
  await next()
}

// Middleware: Select target host based on user cookie
export const selectTargetHost: MiddlewareHandler<Env> = async (c, next) => {
  const cookies = c.get('cookies')

  console.log('parsing1111,', c.req.url)
  const url = new URL(c.req.url)
  const initialPart = url.host.split('.')[0]
  const db = c.get('db')

  // const newPath = pathFromHostnameAndPath(url.hostname, c.req.path)
  // console.log('requested path is', newPath)

  const rows = await db
    .select()
    .from(schema.sessionDomains)
    .where(eq(schema.sessionDomains.slug, initialPart))

  let targetHost = ''
  if (rows.length === 1) {
    targetHost = rows[0].cleartext
  }

  c.set('isLocal', false)
  if (url.host === 'localhost' || url.host.startsWith('localhost:')) {
    targetHost = 'news.ycombinator.com'
    c.set('isLocal', true)
  }

  console.log('host is', url.host)
  console.log('setting targethost to ', targetHost)
  c.set('targetHost', targetHost)
  await next()
}

// Middleware: Log the proxied request
export const logRequest: MiddlewareHandler<Env> = async (c, next) => {
  const targetHost = c.get('targetHost')
  console.log(`Proxying: ${c.req.path} -> https://${targetHost}${c.req.path}`)
  await next()
}
