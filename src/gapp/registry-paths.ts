import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function findProjectRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  while (true) {
    if (fs.existsSync(path.join(dir, 'src/gapp/registry'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(
    `[registry-paths] could not find project root (searched upward from ${path.dirname(fileURLToPath(import.meta.url))})`,
  )
}

export const projectRoot = findProjectRoot()

export const platformRegistryDir = path.join(projectRoot, 'src/gapp/registry')

export const platformLibsDir = path.join(platformRegistryDir, 'libs')

export function platformRegistryFile(name: string): string {
  return path.join(platformRegistryDir, 'deps', name)
}