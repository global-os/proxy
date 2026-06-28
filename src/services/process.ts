import { and, eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema.js'

export async function findOrCreateProcess(
  db: NodePgDatabase<typeof schema>,
  workspaceId: number,
  directoryId: number,
) {
  const [existing] = await db
    .select({ id: schema.process.id })
    .from(schema.process)
    .where(and(
      eq(schema.process.workspace_id, workspaceId),
      eq(schema.process.directory_id, directoryId),
    ))
    .limit(1)

  if (existing) return existing

  const [created] = await db
    .insert(schema.process)
    .values({
      workspace_id: workspaceId,
      directory_id: directoryId,
    })
    .returning({ id: schema.process.id })

  return created
}