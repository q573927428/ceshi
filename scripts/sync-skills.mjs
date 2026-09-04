import { writeFile } from 'node:fs/promises'

const SKILL_SOURCE_URL = 'https://www.stzb163.online/assets/skill-GaUvPWkB.js'
const TAG_SOURCE_URL = 'https://www.stzb163.online/api/skill-tags'
const SKILL_OUTPUT = new URL('../app/data/skills.json', import.meta.url)
const TAG_OUTPUT = new URL('../app/data/skillTags.json', import.meta.url)

function extractArray(source) {
  const start = source.search(/\b(?:const|let|var)\s+\w+\s*=\s*\[/)
  if (start < 0) throw new Error('未找到技能数组')
  const arrayStart = source.indexOf('[', start)
  let depth = 0; let quote = null; let escaped = false
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
    if (char === ']') { depth -= 1; if (depth === 0) return source.slice(arrayStart, i + 1) }
  }
  throw new Error('技能数组未闭合')
}

const skillResponse = await fetch(SKILL_SOURCE_URL)
if (!skillResponse.ok) throw new Error(`技能下载失败：HTTP ${skillResponse.status}`)
const skillSource = await skillResponse.text()
const skills = Function(`"use strict"; return (${extractArray(skillSource)})`)()
if (!Array.isArray(skills) || !skills.length) throw new Error('解析出的技能数据为空')

const tagResponse = await fetch(TAG_SOURCE_URL)
if (!tagResponse.ok) throw new Error(`标签下载失败：HTTP ${tagResponse.status}`)
const tagPayload = await tagResponse.json()
if (tagPayload.code !== 0 || !tagPayload.data?.tagsById) throw new Error('标签接口返回格式不正确')

await writeFile(SKILL_OUTPUT, `${JSON.stringify(skills, null, 2)}\n`, 'utf8')
await writeFile(TAG_OUTPUT, `${JSON.stringify(tagPayload.data, null, 2)}\n`, 'utf8')
console.log(`已同步 ${skills.length} 个技能 -> ${SKILL_OUTPUT.pathname}`)
console.log(`已同步 ${Object.keys(tagPayload.data.tagsById).length} 个技能标签映射 -> ${TAG_OUTPUT.pathname}`)
