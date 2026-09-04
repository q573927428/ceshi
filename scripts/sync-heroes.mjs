import { writeFile } from 'node:fs/promises'

const SOURCE_URL = 'https://www.stzb163.online/assets/heroextra-BrgUoCPj.js'
const OUTPUT_FILE = new URL('../app/data/heroextra.json', import.meta.url)

function extractArray(source) {
  // 当前资源导出形态为 const e=[...];function...;export{...,e as h}。
  // 用括号配对而不是贪婪正则，避免描述文本中的 [] 影响截取结果。
  const start = source.search(/\b(?:const|let|var)\s+\w+\s*=\s*\[/)
  if (start < 0) throw new Error('未找到武将数组')
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
  throw new Error('武将数组未闭合')
}

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}`)
const source = await response.text()
const arraySource = extractArray(source)
// 资源是合法的 JavaScript 对象字面量（属性名未加引号），用受控表达式求值后转成标准 JSON。
const heroes = Function(`"use strict"; return (${arraySource})`)()
if (!Array.isArray(heroes) || heroes.length === 0) throw new Error('解析出的武将数据为空')

await writeFile(OUTPUT_FILE, `${JSON.stringify(heroes, null, 2)}\n`, 'utf8')
console.log(`已同步 ${heroes.length} 名武将 -> ${OUTPUT_FILE.pathname}`)
