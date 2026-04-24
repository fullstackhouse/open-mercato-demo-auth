import { readFile, writeFile } from 'node:fs/promises'

const files = [
  'dist/DemoAuthAutofill.js',
]

const DIRECTIVE = "'use client';\n"

for (const file of files) {
  const contents = await readFile(file, 'utf8')
  if (contents.startsWith("'use client'") || contents.startsWith('"use client"')) continue
  await writeFile(file, DIRECTIVE + contents, 'utf8')
  console.log(`prepended 'use client' to ${file}`)
}
