import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
)

export const platformRegistryDir = path.join(projectRoot, 'src/gapp/registry')

export function platformRegistryFile(name: string): string {
  return path.join(platformRegistryDir, name)
}