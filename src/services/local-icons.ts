import { and, eq, isNull } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { isZanyIconId } from '../gapp/icon-ids.js'
import * as schema from '../db/schema.js'

export async function resolveLocalIconsDirectoryId(
  db: NodePgDatabase<typeof schema>,
  userId: string,
): Promise<number | null> {
  const [usersDir] = await db
    .select({ id: schema.directory.id })
    .from(schema.directory)
    .where(and(
      eq(schema.directory.user_id, userId),
      eq(schema.directory.name, 'Users'),
      isNull(schema.directory.parent_id),
    ))
    .limit(1)

  if (!usersDir) return null

  const [localDir] = await db
    .select({ id: schema.directory.id })
    .from(schema.directory)
    .where(and(
      eq(schema.directory.parent_id, usersDir.id),
      eq(schema.directory.name, '.local'),
    ))
    .limit(1)

  if (!localDir) return null

  const [iconsDir] = await db
    .select({ id: schema.directory.id })
    .from(schema.directory)
    .where(and(
      eq(schema.directory.parent_id, localDir.id),
      eq(schema.directory.name, 'icons'),
    ))
    .limit(1)

  return iconsDir?.id ?? null
}

export async function readLocalIconBmp(
  db: NodePgDatabase<typeof schema>,
  userId: string,
  iconId: string,
): Promise<Buffer | null> {
  if (!isZanyIconId(iconId)) return null

  const iconsDirId = await resolveLocalIconsDirectoryId(db, userId)
  if (!iconsDirId) return null

  const [row] = await db
    .select({ content: schema.file.content })
    .from(schema.file)
    .where(and(
      eq(schema.file.parent_id, iconsDirId),
      eq(schema.file.name, `${iconId}.bmp`),
    ))
    .limit(1)

  if (!row) return null

  return Buffer.isBuffer(row.content) ? row.content : Buffer.from(row.content)
}