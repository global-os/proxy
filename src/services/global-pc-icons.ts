import { and, eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { isZanyIconId } from '../gapp/icon-ids.js'
import * as schema from '../db/schema.js'
import { resolveGappIconId } from './gapp-metadata.js'

export async function getGlobalPcIconMap(
  db: NodePgDatabase<typeof schema>,
  globalPcId: number,
): Promise<Record<string, string>> {
  const rows = await db
    .select({
      entry_name: schema.globalPcIcon.entry_name,
      icon_id: schema.globalPcIcon.icon_id,
    })
    .from(schema.globalPcIcon)
    .where(eq(schema.globalPcIcon.global_pc_id, globalPcId))

  const map: Record<string, string> = {}
  for (const row of rows) {
    if (isZanyIconId(row.icon_id)) {
      map[row.entry_name] = row.icon_id
    }
  }
  return map
}

export async function setGlobalPcIconIfAbsent(
  db: NodePgDatabase<typeof schema>,
  globalPcId: number,
  entryName: string,
  iconId: string,
): Promise<void> {
  if (!isZanyIconId(iconId)) return

  await db
    .insert(schema.globalPcIcon)
    .values({
      global_pc_id: globalPcId,
      entry_name: entryName,
      icon_id: iconId,
    })
    .onConflictDoNothing({
      target: [schema.globalPcIcon.global_pc_id, schema.globalPcIcon.entry_name],
    })
}

export async function setGlobalPcIcon(
  db: NodePgDatabase<typeof schema>,
  globalPcId: number,
  entryName: string,
  iconId: string,
): Promise<void> {
  if (!isZanyIconId(iconId)) {
    throw new Error('Invalid icon id')
  }

  await db
    .insert(schema.globalPcIcon)
    .values({
      global_pc_id: globalPcId,
      entry_name: entryName,
      icon_id: iconId,
    })
    .onConflictDoUpdate({
      target: [schema.globalPcIcon.global_pc_id, schema.globalPcIcon.entry_name],
      set: { icon_id: iconId },
    })
}

export async function resetGlobalPcIcons(
  db: NodePgDatabase<typeof schema>,
  globalPcId: number,
): Promise<void> {
  await db
    .delete(schema.globalPcIcon)
    .where(eq(schema.globalPcIcon.global_pc_id, globalPcId))
}

export async function resolveDesktopEntryIcon(
  db: NodePgDatabase<typeof schema>,
  globalPcId: number,
  directoryId: number,
  entryName: string,
): Promise<string | undefined> {
  if (!entryName.endsWith('.gapp')) return undefined

  const [row] = await db
    .select({ icon_id: schema.globalPcIcon.icon_id })
    .from(schema.globalPcIcon)
    .where(and(
      eq(schema.globalPcIcon.global_pc_id, globalPcId),
      eq(schema.globalPcIcon.entry_name, entryName),
    ))
    .limit(1)

  if (row && isZanyIconId(row.icon_id)) {
    return row.icon_id
  }

  const manifestIcon = await resolveGappIconId(db, directoryId, entryName)
  if (manifestIcon) {
    await setGlobalPcIconIfAbsent(db, globalPcId, entryName, manifestIcon)
    return manifestIcon
  }

  return undefined
}