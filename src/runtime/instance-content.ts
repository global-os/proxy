import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import * as tar from 'tar'

const roots = new Map<number, { rootDir: string; checksum: string }>()

export const INSTANCE_MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
}

async function extractTar(tarBytes: Buffer, destDir: string): Promise<void> {
  fs.mkdirSync(destDir, { recursive: true })
  const readable = Readable.from(tarBytes)
  await tar.extract({ cwd: destDir }, readable as any)
}

function findIndexHtml(rootDir: string): string | null {
  const direct = path.join(rootDir, 'index.html')
  if (fs.existsSync(direct)) return direct
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const nested = path.join(rootDir, entry.name, 'index.html')
    if (fs.existsSync(nested)) return nested
  }
  return null
}

export function resolveInstanceFile(rootDir: string, urlPath: string): string | null {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const relative = safePath === '/' ? '' : safePath.replace(/^\//, '')
  const candidate = path.join(rootDir, relative)
  if (!candidate.startsWith(rootDir)) return null

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate
  }

  if (fs.existsSync(path.join(candidate, 'index.html'))) {
    return path.join(candidate, 'index.html')
  }

  if (relative === '' || relative.endsWith('/')) {
    const index = findIndexHtml(rootDir)
    if (index) return index
  }

  return null
}

export function isInstanceContentCached(instanceId: number): boolean {
  return roots.has(instanceId)
}

const tmpDirPrefix = (instanceId: number) => `globalos-instance-${instanceId}-`

/** Re-register an extracted bundle after a serverless cold start (in-memory map was lost). */
export async function tryRecoverInstanceContent(
  instanceId: number,
  checksum: string,
): Promise<boolean> {
  if (roots.has(instanceId)) return true

  let entries: fs.Dirent[]
  try {
    entries = await fs.promises.readdir(os.tmpdir(), { withFileTypes: true })
  } catch {
    return false
  }

  const prefix = tmpDirPrefix(instanceId)
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(prefix)) continue

    const rootDir = path.join(os.tmpdir(), entry.name)
    const marker = path.join(rootDir, '.globalos-checksum')
    try {
      const stored = (await fs.promises.readFile(marker, 'utf-8')).trim()
      if (stored !== checksum) continue
    } catch {
      if (!findIndexHtml(rootDir)) continue
    }

    if (!findIndexHtml(rootDir)) continue
    roots.set(instanceId, { rootDir, checksum })
    console.log(`[instance] recovered ${instanceId} from ${rootDir}`)
    return true
  }

  return false
}

export async function ensureInstanceContent(
  instanceId: number,
  tarBytes: Buffer,
  checksum: string,
): Promise<string> {
  const existing = roots.get(instanceId)
  if (existing?.checksum === checksum) {
    return existing.rootDir
  }

  if (existing) {
    await evictInstanceContent(instanceId)
  }

  const rootDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `globalos-instance-${instanceId}-`),
  )
  await extractTar(tarBytes, rootDir)
  await fs.promises.writeFile(path.join(rootDir, '.globalos-checksum'), checksum, 'utf-8')
  roots.set(instanceId, { rootDir, checksum })
  return rootDir
}

export async function evictInstanceContent(instanceId: number): Promise<void> {
  const existing = roots.get(instanceId)
  if (!existing) return
  roots.delete(instanceId)
  await fs.promises.rm(existing.rootDir, { recursive: true, force: true })
}

export function resolveCachedInstanceFile(instanceId: number, urlPath: string): string | null {
  const existing = roots.get(instanceId)
  if (!existing) return null
  return resolveInstanceFile(existing.rootDir, urlPath)
}