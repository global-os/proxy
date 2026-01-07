import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema.js';
import relations from './relations.js';

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // host: process.env.PGHOST,
  // port: parseInt(process.env.PGPORT ?? '5432'),
  // user: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  // database: process.env.PGDATABASE,
};

// Create connection pool
const pool = new Pool(dbConfig);

export const db = drizzle({ schema, relations, client: pool })

// Test connection on startup
export async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}