import { createRequire } from 'node:module'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as esbuild from 'esbuild'
import { compileString } from 'squint-cljs/node-api.js'
import { formatExecError } from './exec-error.js'
import { platformRegistryDir } from './registry-paths.js'

const require = createRequire(import.meta.url)

function squintRuntimeSourceDir(): string {
  const staged = path.join(platformRegistryDir, 'squint-cljs')
  if (fs.existsSync(path.join(staged, 'core.js'))) return staged
  return path.dirname(require.resolve('squint-cljs/node-api.js'))
}

async function stageSquintRuntime(tmp: string): Promise<void> {
  const src = squintRuntimeSourceDir()
  const dest = path.join(tmp, 'node_modules', 'squint-cljs')
  await fsp.mkdir(path.dirname(dest), { recursive: true })
  await fsp.cp(src, dest, { recursive: true })
}

function globalBanner(externals: Record<string, string>): string {
  const lines = Object.entries(externals).map(
    ([, globalName]) => `const ${globalName}=globalThis.${globalName};`,
  )
  return lines.join('')
}

export async function compileSquintSource(
  sourcePath: string,
  spec: { output: string; externals?: Record<string, string> },
): Promise<Buffer> {
  const ext = path.extname(spec.output) || '.js'
  const source = await fsp.readFile(sourcePath, 'utf8')
  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'gapp-squint-'))

  try {
    let compiled: { javascript?: string }
    try {
      compiled = await compileString(source, {
        extension: ext,
        'filename': path.basename(sourcePath),
      })
    } catch (err) {
      const formatted = formatExecError(err)
      const error = new Error(`squint compile: ${formatted.message}`)
      if (formatted.detail) {
        ;(error as Error & { detail?: string }).detail = formatted.detail
      }
      throw error
    }

    const javascript = compiled.javascript
    if (!javascript) {
      throw new Error('squint compile: no javascript output')
    }

    const externals = spec.externals ?? {}
    const banner = globalBanner(externals)

    const entryPath = path.join(tmp, 'entry.js')
    await fsp.writeFile(entryPath, javascript)
    await stageSquintRuntime(tmp)

    try {
      const result = await esbuild.build({
        entryPoints: [entryPath],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        write: false,
        banner: banner ? { js: banner } : undefined,
      })

      const output = result.outputFiles[0]?.contents
      if (!output) {
        throw new Error('esbuild bundle: no output')
      }
      return Buffer.from(output)
    } catch (err) {
      const formatted = formatExecError(err)
      const error = new Error(`esbuild bundle: ${formatted.message}`)
      if (formatted.detail) {
        ;(error as Error & { detail?: string }).detail = formatted.detail
      }
      throw error
    }
  } finally {
    await fsp.rm(tmp, { recursive: true, force: true })
  }
}