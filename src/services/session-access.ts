import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import * as schema from '../db/schema.js'
import { LaunchError } from './errors.js'

export async function requireWorkspaceSession(userId: string, sessionId: number) {
  const [row] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(and(
      eq(schema.sessions.id, sessionId),
      eq(schema.sessions.user_id, userId),
    ))
    .limit(1)

  if (!row) {
    throw new LaunchError('Workspace session not found', 404)
  }

  return row
}

export async function requireLaunchableApp(userId: string, directoryId: number) {
  const [appDir] = await db
    .select({ id: schema.directory.id, name: schema.directory.name })
    .from(schema.directory)
    .where(and(
      eq(schema.directory.id, directoryId),
      eq(schema.directory.user_id, userId),
    ))
    .limit(1)

  if (!appDir) {
    throw new LaunchError('App not found on desktop', 404)
  }

  if (!appDir.name.endsWith('.gapp')) {
    throw new LaunchError('Only .gapp bundles can be launched', 400)
  }

  return appDir
}