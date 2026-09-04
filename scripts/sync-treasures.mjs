import { writeFile } from 'node:fs/promises'

const SOURCE_URL = 'https://www.stzb163.online/assets/armsdata-CLFtyGj8.js'
const OUTPUT_FILE = new URL('../app/data/treasures.json', import.meta.url)

function extractArray(source, variableName) {
  // 压缩后的资源可能将多个变量合并在同一个声明中（如 const t=...,m=...,v=[...]）。
  const declaration = new RegExp(`(?:\\b(?:const|let|var)\\s+|[,;])${variableName}\\s*=\\s*\\[`)
  const start = source.search(declaration)
  if (start < 0) throw new Error(`未找到宝物数组（${variableName}）`)
  const arrayStart = source.indexOf('[', start)
  let depth = 0
  let quote = null
  let escaped = false
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") { quote = char; continue }
    if (char === '[') depth += 1
    if (char === ']') {
      depth -= 1
      if (depth === 0) return source.slice(arrayStart, i + 1)
    }
  }
  throw new Error('宝物数组未闭合')
}

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}`)
const source = await response.text()
const treasures = Function(`"use strict"; return (${extractArray(source, 'v')})`)()
if (!Array.isArray(treasures) || treasures.length === 0) throw new Error('解析出的宝物数据为空')

await writeFile(OUTPUT_FILE, `${JSON.stringify(treasures, null, 2)}\n`, 'utf8')
console.log(`已同步 ${treasures.length} 件宝物 -> ${OUTPUT_FILE.pathname}`)
