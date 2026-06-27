import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function resolveProjectRoot(): string {
  const candidates = [
    process.cwd(),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'),
    '/var/task',
  ]

  for (const root of candidates) {
    const stagedSquint = path.join(root, 'src/gapp/squint-runtime/core.js')
    if (fs.existsSync(stagedSquint)) return root
    const squintCli = path.join(root, 'node_modules/squint-cljs/node_cli.js')
    if (fs.existsSync(squintCli)) return root
  }

  return process.cwd()
}

export const projectRoot = resolveProjectRoot()

export const platformRegistryDir = path.join(projectRoot, 'src/gapp/registry')

export function platformRegistryFile(name: string): string {
  return path.join(platformRegistryDir, name)
}