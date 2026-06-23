import fs from 'node:fs'
import path from 'node:path'

const distAssets = path.join(process.cwd(), 'src/frontend/dist/assets')
const badPatterns = [
  /Object\.defineProperty\(exports,\s*["']__esModule["']/,
  /^\s*exports\./m,
]

if (!fs.existsSync(distAssets)) {
  console.error('Missing frontend dist assets:', distAssets)
  process.exit(1)
}

const failures = []

for (const file of fs.readdirSync(distAssets)) {
  if (!file.endsWith('.js')) continue

  const contents = fs.readFileSync(path.join(distAssets, file), 'utf8')
  for (const pattern of badPatterns) {
    if (pattern.test(contents)) {
      failures.push(`${file} matched ${pattern}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Frontend bundle contains unwrapped CommonJS:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('Frontend bundle verification passed')