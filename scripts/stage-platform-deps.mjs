import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src/gapp/registry/deps')
const targets = [path.join(root, 'dist/src/gapp/registry/deps')]

for (const dest of targets) {
  await fs.mkdir(dest, { recursive: true })
  for (const name of ['yjs.js', 'rxjs.js']) {
    await fs.copyFile(path.join(src, name), path.join(dest, name))
  }
  console.log(`Staged platform deps at ${dest}`)
}