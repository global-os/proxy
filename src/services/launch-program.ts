import { and, eq } from 'drizzle-orm'
import { hashDir } from '../db/file.js'
import { getOrCreateImage } from '../db/image.js'
import { db } from '../db/index.js'
import * as schema from '../db/schema.js'
import { instancePublicUrl } from '../runtime/constants.js'
import {
  findRunningInstanceForDirectory,
  startInstanceRuntime,
  touchInstance,
} from '../runtime/instance-manager.js'

export type LaunchResult = {
  processId: number
  instanceId: number
  url: string
  state: 'running' | 'starting'
  reused: boolean
}

export async function launchProgram(opts: {
  userId: string
  sessionId: number
  directoryId: number
  directoryName: string
}): Promise<LaunchResult> {
  const { userId, sessionId, directoryId, directoryName } = opts

  const [workspaceSession] = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(and(
      eq(schema.sessions.id, sessionId),
      eq(schema.sessions.user_id, userId),
    ))
    .limit(1)

  if (!workspaceSession) {
    throw new LaunchError('Workspace session not found', 404)
  }

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

  const directory_checksum = await hashDir(directoryId)
  const image = await getOrCreateImage(directoryId)

  const existing = await findRunningInstanceForDirectory(sessionId, directoryId, directory_checksum)
  if (existing) {
    await touchInstance(existing.id)
    return {
      processId: existing.process_id,
      instanceId: existing.id,
      url: instancePublicUrl(existing.id),
      state: 'running',
      reused: true,
    }
  }

  const [processRow] = await db
    .insert(schema.process)
    .values({
      session_id: sessionId,
      directory_id: directoryId,
    })
    .returning({ id: schema.process.id })

  const [instanceRow] = await db
    .insert(schema.instances)
    .values({
      process_id: processRow.id,
      image_id: image.id,
      directory_checksum,
      state: 'starting',
    })
    .returning({ id: schema.instances.id })

  await startInstanceRuntime(instanceRow.id, directory_checksum, image.tar_bytes!)

  await db
    .update(schema.instances)
    .set({
      state: 'running',
      last_used_at: new Date(),
    })
    .where(eq(schema.instances.id, instanceRow.id))

  return {
    processId: processRow.id,
    instanceId: instanceRow.id,
    url: instancePublicUrl(instanceRow.id),
    state: 'running',
    reused: false,
  }
}

export class LaunchError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'LaunchError'
  }
}