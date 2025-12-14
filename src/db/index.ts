import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import {  pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

import * as schema from './schema';

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

export const db = drizzle(pool, { schema });

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