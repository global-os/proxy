import fs from 'node:fs'
import path from 'node:path'
import { projectRoot } from './registry-paths.js'

function requirePath(candidate: string, label: string): string {
  if (!fs.existsSync(candidate)) {
    throw new Error(`${label} not found at ${candidate}`)
  }
  return candidate
}

/** Squint CLI entry — do not use `npx` on Vercel (read-only home dir). */
export function squintCliPath(): string {
  return requirePath(
    path.join(projectRoot, 'node_modules/squint-cljs/node_cli.js'),
    'squint-cljs CLI',
  )
}

/** esbuild binary — do not use `npx` on Vercel. */
export function esbuildBinPath(): string {
  return requirePath(
    path.join(projectRoot, 'node_modules/esbuild/bin/esbuild'),
    'esbuild binary',
  )
}