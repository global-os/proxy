import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function findRegistryDir(): string {
  const start = path.dirname(fileURLToPath(import.meta.url))
  let dir = start
  while (true) {
    const candidate = path.join(dir, 'src/gapp/registry')
    if (fs.existsSync(candidate)) {
      console.log(`[registry-paths] found: ${candidate} (from ${start})`)
      return candidate
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(
    `[registry-paths] could not locate src/gapp/registry (searched upward from ${start})`,
  )
}

export const platformRegistryDir = findRegistryDir()

export const platformLibsDir = path.join(platformRegistryDir, 'libs')

export function platformRegistryFile(name: string): string {
  return path.join(platformRegistryDir, 'deps', name)
}