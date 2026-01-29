import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema.js'
import relations from './relations.js'

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // host: process.env.PGHOST,
  // port: parseInt(process.env.PGPORT ?? '5432'),
  // user: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  // database: process.env.PGDATABASE,
}

// Create connection pool
const pool = new Pool(dbConfig)

export const db = drizzle({ schema, relations, client: pool })

// Test connection on startup
export async function testConnection() {
  console.log('testing conn')

  try {
    const result = await Promise.race([
      pool.query('SELECT 1'),
      new Promise((res) => {
        setTimeout(() => {
          res('timeout')
        }, 3000)
      }),
    ])

    if (result === 'timeout') {
      console.error('Database connection failed -- timed out')
    } else {
      console.log('Connected to db successfully')
    }
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
