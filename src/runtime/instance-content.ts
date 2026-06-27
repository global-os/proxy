import path from 'node:path'
import { Readable } from 'node:stream'
import * as tar from 'tar'

export const INSTANCE_MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
}

type InstanceBundle = {
  checksum: string
  files: Map<string, Buffer>
}

const bundles = new Map<number, InstanceBundle>()

function findIndexPath(files: Map<string, Buffer>): string | null {
  if (files.has('index.html')) return 'index.html'
  for (const entryPath of files.keys()) {
    if (entryPath.endsWith('/index.html')) return entryPath
  }
  return null
}

function resolveBundlePath(files: Map<string, Buffer>, urlPath: string): string | null {
  const safePath = urlPath.replace(/^(\.\.(\/|\\|$))+/, '')
  const relative = safePath === '/' ? '' : safePath.replace(/^\//, '')

  if (relative && files.has(relative)) return relative

  if (relative) {
    const withSlash = relative.endsWith('/') ? relative : `${relative}/`
    const indexCandidate = `${withSlash}index.html`
    if (files.has(indexCandidate)) return indexCandidate
  }

  if (!relative || relative.endsWith('/')) {
    return findIndexPath(files)
  }

  return null
}

async function parseTarBytes(tarBytes: Buffer): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>()

  await new Promise<void>((resolve, reject) => {
    const parser = new tar.Parser({
      onReadEntry(entry) {
        if (entry.type !== 'File') {
          entry.resume()
          return
        }

        const chunks: Buffer[] = []
        entry.on('data', (chunk: Buffer) => chunks.push(chunk))
        entry.on('end', () => {
          files.set(entry.path, Buffer.concat(chunks))
        })
      },
    })
    parser.on('end', () => resolve())
    parser.on('error', reject)
    Readable.from(tarBytes).pipe(parser)
  })

  return files
}

export function isInstanceContentCached(
  instanceId: number,
  expectedChecksum?: string,
): boolean {
  const bundle = bundles.get(instanceId)
  if (!bundle) return false
  if (expectedChecksum && bundle.checksum !== expectedChecksum) return false
  return true
}

export async function ensureInstanceContent(
  instanceId: number,
  tarBytes: Buffer,
  checksum: string,
): Promise<void> {
  const existing = bundles.get(instanceId)
  if (existing?.checksum === checksum) return

  const files = await parseTarBytes(tarBytes)
  bundles.set(instanceId, { checksum, files })
}

export async function evictInstanceContent(instanceId: number): Promise<void> {
  bundles.delete(instanceId)
}

export type InstanceFile = {
  path: string
  data: Buffer
}

export function resolveCachedInstanceFile(
  instanceId: number,
  urlPath: string,
): InstanceFile | null {
  const bundle = bundles.get(instanceId)
  if (!bundle) return null

  const entryPath = resolveBundlePath(bundle.files, urlPath)
  if (!entryPath) return null

  const data = bundle.files.get(entryPath)
  if (!data) return null

  return { path: entryPath, data }
}