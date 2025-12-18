import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './db/schema'
import { Pool } from 'pg'

// Define context types for TypeScript
export type Env = {
  Variables: {
    db: NodePgDatabase<typeof schema> & { $client: Pool }
    cookies: Record<string, string>
    targetHost: string
    isLocal: boolean
  }
}
