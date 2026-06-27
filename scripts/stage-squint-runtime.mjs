import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = path.join(root, 'node_modules/squint-cljs')

async function writeRuntime(out) {
  await fs.rm(out, { recursive: true, force: true })
  await fs.mkdir(out, { recursive: true })
  await fs.copyFile(path.join(pkg, 'core.js'), path.join(out, 'core.js'))
  await fs.cp(path.join(pkg, 'src/squint'), path.join(out, 'src/squint'), {
    recursive: true,
  })
}

const targets = [
  path.join(root, 'src/gapp/squint-runtime'),
  path.join(root, 'dist/src/gapp/squint-runtime'),
]

for (const out of targets) {
  await writeRuntime(out)
  console.log(`Staged squint runtime at ${out}`)
}