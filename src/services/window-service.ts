import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import * as schema from '../db/schema.js'
import { instancePublicUrl } from '../runtime/constants.js'

export type WorkspaceWindowDto = {
  id: number
  sessionId: number
  processId: number
  instanceId: number
  title: string
  bundleName: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  src: string
}

function toDto(row: typeof schema.workspaceWindow.$inferSelect): WorkspaceWindowDto {
  return {
    id: row.id,
    sessionId: row.session_id,
    processId: row.process_id,
    instanceId: row.instance_id,
    title: row.title,
    bundleName: row.bundle_name,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    zIndex: row.z_index,
    src: instancePublicUrl(row.instance_id),
  }
}

export async function listSessionWindows(sessionId: number): Promise<WorkspaceWindowDto[]> {
  const rows = await db
    .select()
    .from(schema.workspaceWindow)
    .where(eq(schema.workspaceWindow.session_id, sessionId))
    .orderBy(schema.workspaceWindow.z_index)

  return rows.map(toDto)
}

export async function listProcessWindows(
  sessionId: number,
  processId: number,
): Promise<WorkspaceWindowDto[]> {
  const rows = await db
    .select()
    .from(schema.workspaceWindow)
    .where(and(
      eq(schema.workspaceWindow.session_id, sessionId),
      eq(schema.workspaceWindow.process_id, processId),
    ))
    .orderBy(desc(schema.workspaceWindow.z_index))

  return rows.map(toDto)
}

async function nextZIndex(sessionId: number): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${schema.workspaceWindow.z_index}), 0)` })
    .from(schema.workspaceWindow)
    .where(eq(schema.workspaceWindow.session_id, sessionId))

  return (row?.max ?? 0) + 1
}

export async function createWindow(opts: {
  sessionId: number
  processId: number
  instanceId: number
  title: string
  bundleName: string
  x?: number
  y?: number
  width?: number
  height?: number
}): Promise<WorkspaceWindowDto> {
  const zIndex = await nextZIndex(opts.sessionId)
  const [row] = await db
    .insert(schema.workspaceWindow)
    .values({
      session_id: opts.sessionId,
      process_id: opts.processId,
      instance_id: opts.instanceId,
      title: opts.title,
      bundle_name: opts.bundleName,
      x: opts.x ?? 0,
      y: opts.y ?? 0,
      width: opts.width ?? 720,
      height: opts.height ?? 480,
      z_index: zIndex,
      last_focused_at: new Date(),
    })
    .returning()

  return toDto(row)
}

export async function focusWindow(sessionId: number, windowId: number): Promise<WorkspaceWindowDto | null> {
  const zIndex = await nextZIndex(sessionId)
  const [row] = await db
    .update(schema.workspaceWindow)
    .set({
      z_index: zIndex,
      last_focused_at: new Date(),
    })
    .where(and(
      eq(schema.workspaceWindow.id, windowId),
      eq(schema.workspaceWindow.session_id, sessionId),
    ))
    .returning()

  return row ? toDto(row) : null
}

export async function updateWindowGeometry(
  sessionId: number,
  windowId: number,
  patch: { x?: number; y?: number; width?: number; height?: number },
): Promise<void> {
  await db
    .update(schema.workspaceWindow)
    .set({
      ...(patch.x !== undefined ? { x: patch.x } : {}),
      ...(patch.y !== undefined ? { y: patch.y } : {}),
      ...(patch.width !== undefined ? { width: patch.width } : {}),
      ...(patch.height !== undefined ? { height: patch.height } : {}),
    })
    .where(and(
      eq(schema.workspaceWindow.id, windowId),
      eq(schema.workspaceWindow.session_id, sessionId),
    ))
}