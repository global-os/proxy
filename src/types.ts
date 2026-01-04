import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './db/schema.js'
import { Pool } from 'pg'
import { auth } from "./auth.js";

// Define context types for TypeScript
export type Env = {
  Variables: {
    db: NodePgDatabase<typeof schema> & { $client: Pool }
    cookies: Record<string, string>
    targetHost: string
    isLocal: boolean
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}
