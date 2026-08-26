#!/usr/bin/env node

const [, , ordersn, ...nameParts] = process.argv

if (!ordersn) {
  console.error('用法: node scripts/find-stzb-id.mjs <ordersn> [名称]')
  console.error('示例: node scripts/find-stzb-id.mjs 202608162302116-1-AWXTXXVNKKKRRW 荀彧')
  process.exit(1)
}

const name = nameParts.join(' ').trim()
const url = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${encodeURIComponent(ordersn)}.json`

try {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)

  const payload = await response.json()
  if (typeof payload.equip_desc !== 'string') {
    throw new Error('响应中没有 equip_desc，订单号可能无效或接口已变更')
  }

  const decoded = payload.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
  const full = JSON.parse(decoded)
  const cards = Array.isArray(full.card) ? full.card : []
  const skills = Array.isArray(full.skill) ? full.skill : []
  const matches = (value) => !name || String(value || '').includes(name)

  const cardResults = cards
    .filter((card) => matches(card.name))
    .map((card) => ({
      type: '武将',
      name: card.name || '',
      hero_id: card.hero_id,
      icon_hero_id: card.icon_hero_id,
      season: card.season,
    }))

  const skillResults = skills
    .filter((skill) => matches(skill.name))
    .map((skill) => ({
      type: '战法',
      name: skill.name || '',
      skill_id: skill.skill_id,
      skill_type: skill.skill_type,
    }))

  const results = [...cardResults, ...skillResults]
  if (!results.length) {
    console.log(name ? `未找到包含“${name}”的武将或战法` : '没有可输出的数据')
    process.exit(0)
  }

  console.table(results)
} catch (error) {
  console.error(`查询失败: ${error.message}`)
  process.exit(1)
}
