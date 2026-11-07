// Writes the rendered page into dist/index.html, so content paints before any JavaScript runs.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const ssrDir = resolve('dist-ssr')
const entry = ['entry-server.js', 'entry-server.mjs']
  .map((name) => resolve(ssrDir, name))
  .find((file) => existsSync(file))

const { render } = await import(pathToFileURL(entry).href)

const font = readdirSync(resolve(dist, 'assets')).find((name) =>
  /^hanken-grotesk-latin-wght-normal.*\.woff2$/.test(name),
)
const base = process.env.BASE_PATH || '/'
const preload = font
  ? `<link rel="preload" href="${base}assets/${font}" as="font" type="font/woff2" crossorigin />`
  : ''

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
const html = template.replace('<!--app-->', render()).replace('</head>', `${preload}</head>`)

writeFileSync(resolve(dist, 'index.html'), html)
rmSync(ssrDir, { recursive: true, force: true })
console.log(`Prerendered dist/index.html (${(html.length / 1024).toFixed(1)} KB)`)
