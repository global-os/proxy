import { and, desc, eq } from 'drizzle-orm'
import { hashDir } from '../db/file.js'
import { getOrCreateImage } from '../db/image.js'
import { db } from '../db/index.js'
import * as schema from '../db/schema.js'
import { instancePublicUrl } from '../runtime/constants.js'
import { startInstanceRuntime } from '../runtime/instance-manager.js'
import { LaunchError } from './errors.js'

export type CreatedInstance = {
  instanceId: number
  url: string
  restarted: boolean
}

/** Create a new runtime instance for a process (apps may call this multiple times). */
export async function createInstanceForProcess(processId: number): Promise<CreatedInstance> {
  const [processRow] = await db
    .select({
      id: schema.process.id,
      directory_id: schema.process.directory_id,
    })
    .from(schema.process)
    .where(eq(schema.process.id, processId))
    .limit(1)

  if (!processRow) {
    throw new LaunchError('Process not found', 404)
  }

  const directory_checksum = await hashDir(processRow.directory_id)
  const image = await getOrCreateImage(processRow.directory_id)

  const [instanceRow] = await db
    .insert(schema.instances)
    .values({
      process_id: processId,
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
    instanceId: instanceRow.id,
    url: instancePublicUrl(instanceRow.id),
    restarted: false,
  }
}

/** Ensure the process has a live primary instance, restarting a stopped one when possible. */
export async function ensurePrimaryInstance(processId: number): Promise<CreatedInstance> {
  const [running] = await db
    .select({ id: schema.instances.id })
    .from(schema.instances)
    .where(and(
      eq(schema.instances.process_id, processId),
      eq(schema.instances.state, 'running'),
    ))
    .orderBy(schema.instances.id)
    .limit(1)

  if (running) {
    return {
      instanceId: running.id,
      url: instancePublicUrl(running.id),
      restarted: false,
    }
  }

  const [stopped] = await db
    .select({
      id: schema.instances.id,
      directory_checksum: schema.instances.directory_checksum,
      image_id: schema.instances.image_id,
    })
    .from(schema.instances)
    .where(and(
      eq(schema.instances.process_id, processId),
      eq(schema.instances.state, 'stopped'),
    ))
    .orderBy(desc(schema.instances.last_used_at))
    .limit(1)

  if (stopped?.image_id) {
    const [imageRow] = await db
      .select({ tar_bytes: schema.image.tar_bytes })
      .from(schema.image)
      .where(eq(schema.image.id, stopped.image_id))
      .limit(1)

    if (imageRow?.tar_bytes) {
      await startInstanceRuntime(stopped.id, stopped.directory_checksum, imageRow.tar_bytes)
      await db
        .update(schema.instances)
        .set({ state: 'running', last_used_at: new Date() })
        .where(eq(schema.instances.id, stopped.id))

      return {
        instanceId: stopped.id,
        url: instancePublicUrl(stopped.id),
        restarted: true,
      }
    }
  }

  return createInstanceForProcess(processId)
}

export async function findOrCreateProcess(sessionId: number, directoryId: number) {
  const [existing] = await db
    .select({ id: schema.process.id })
    .from(schema.process)
    .where(and(
      eq(schema.process.session_id, sessionId),
      eq(schema.process.directory_id, directoryId),
    ))
    .limit(1)

  if (existing) return existing

  const [created] = await db
    .insert(schema.process)
    .values({
      session_id: sessionId,
      directory_id: directoryId,
    })
    .returning({ id: schema.process.id })

  return created
}