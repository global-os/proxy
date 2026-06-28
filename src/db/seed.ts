import fs from 'fs'
import path from 'path'
import { and, eq, isNull } from 'drizzle-orm'
import {
  fixtureBasesForUser,
  fixtureWildcardDir,
  FIXTURE_WILDCARD,
} from './fixture-paths.js'
import { db } from './index.js'
import { user, directory, file } from './schema.js'

type SyncStats = {
  directoriesCreated: number
  filesCreated: number
  filesUpdated: number
}

function hasFixtureSourcesOnDisk(): boolean {
  if (fs.existsSync(fixtureWildcardDir())) return true

  const byUserRoot = path.resolve(process.cwd(), 'fixtures/by-user')
  if (!fs.existsSync(byUserRoot)) return false

  return fs
    .readdirSync(byUserRoot, { withFileTypes: true })
    .some((entry) => entry.isDirectory() && entry.name !== FIXTURE_WILDCARD)
}

export async function seedUserFixtures() {
  if (!hasFixtureSourcesOnDisk()) {
    console.log('Seed: no fixture sources on disk, skipping')
    return
  }

  const users = await db
    .select({ id: user.id, email: user.email })
    .from(user)

  if (users.length === 0) {
    console.log('Seed: no users in database, skipping')
    return
  }

  let seededUsers = 0

  for (const userRow of users) {
    const fixtureBases = fixtureBasesForUser(userRow.email)
    if (fixtureBases.length === 0) continue

    const stats: SyncStats = {
      directoriesCreated: 0,
      filesCreated: 0,
      filesUpdated: 0,
    }

    for (const fixtureBase of fixtureBases) {
      await syncWalk(fixtureBase, null, userRow.id, stats)
    }

    seededUsers += 1
    const changes =
      stats.directoriesCreated + stats.filesCreated + stats.filesUpdated

    if (changes === 0) {
      console.log(`Seed: fixtures already up to date for ${userRow.email}`)
      continue
    }

    console.log(
      `Seed: synced fixtures for ${userRow.email} `
      + `(+${stats.directoriesCreated} dirs, +${stats.filesCreated} files, `
      + `~${stats.filesUpdated} updated)`,
    )
  }

  if (seededUsers === 0) {
    console.log('Seed: no matching users for fixture sources, skipping')
  }
}

async function syncWalk(
  fsPath: string,
  parentId: number | null,
  userId: string,
  stats: SyncStats,
) {
  for (const entry of fs.readdirSync(fsPath, { withFileTypes: true })) {
    const fullPath = path.join(fsPath, entry.name)
    const name = entry.name === '~' ? 'Users' : entry.name

    if (entry.isDirectory()) {
      const dirId = await ensureDirectory(parentId, name, userId, stats)
      await syncWalk(fullPath, dirId, userId, stats)
      continue
    }

    await ensureFile(parentId!, entry.name, fs.readFileSync(fullPath), userId, stats)
  }
}

async function ensureDirectory(
  parentId: number | null,
  name: string,
  userId: string,
  stats: SyncStats,
): Promise<number> {
  const where = parentId === null
    ? and(
      eq(directory.user_id, userId),
      isNull(directory.parent_id),
      eq(directory.name, name),
    )
    : and(eq(directory.parent_id, parentId), eq(directory.name, name))

  const [existing] = await db
    .select({ id: directory.id })
    .from(directory)
    .where(where)
    .limit(1)

  if (existing) return existing.id

  const [created] = await db
    .insert(directory)
    .values({ name, parent_id: parentId, user_id: userId })
    .returning({ id: directory.id })

  stats.directoriesCreated += 1
  return created.id
}

async function ensureFile(
  parentId: number,
  name: string,
  content: Buffer,
  userId: string,
  stats: SyncStats,
) {
  const mime_type = mimeFor(path.extname(name))

  const [existing] = await db
    .select({ id: file.id, content: file.content })
    .from(file)
    .where(and(eq(file.parent_id, parentId), eq(file.name, name)))
    .limit(1)

  if (!existing) {
    await db.insert(file).values({
      name,
      content,
      mime_type,
      hash_method: 'sha1',
      parent_id: parentId,
      user_id: userId,
    })
    stats.filesCreated += 1
    return
  }

  const existingContent = Buffer.isBuffer(existing.content)
    ? existing.content
    : Buffer.from(existing.content)

  if (existingContent.equals(content)) return

  await db
    .update(file)
    .set({ content, mime_type })
    .where(eq(file.id, existing.id))

  stats.filesUpdated += 1
}

function mimeFor(ext: string): string {
  const map: Record<string, string> = {
    '.app': 'text/html',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.cljs': 'text/plain',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}