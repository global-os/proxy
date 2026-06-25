import { Pool, type PoolConfig } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema.js'

const isServerless = Boolean(process.env.VERCEL)

function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return undefined
  if (url.includes('connect_timeout=')) return url
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}connect_timeout=10`
}

function buildPoolConfig(): PoolConfig {
  const connectionString = resolveDatabaseUrl()
  const sslEnabled = process.env.DATABASE_SSL !== 'false'

  const config: PoolConfig = {
    connectionString,
    max: isServerless ? 1 : 10,
    idleTimeoutMillis: isServerless ? 5_000 : 30_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: isServerless,
  }

  if (sslEnabled) {
    config.ssl = { rejectUnauthorized: false }
  }

  if (process.env.DATABASE_IPV4 === 'true') {
    ;(config as PoolConfig & { family?: number }).family = 4
  }

  return config
}

// Create connection pool
export const pool = new Pool(buildPoolConfig())

export const db = drizzle({ schema, client: pool })

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

export async function pingDatabase(timeoutMs = 5_000): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'DATABASE_URL is not set' }
  }

  try {
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Database ping timed out after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database connection failed'
    return { ok: false, error: message }
  }
}

// Test connection on startup
export async function testConnection() {
  console.log('testing conn')

  const result = await pingDatabase(3_000)
  if (!result.ok) {
    console.error('Database connection failed:', result.error)
    return
  }

  console.log('Connected to db successfully')
}