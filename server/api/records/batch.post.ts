import { query, toCamelCase, type RecordRow } from '../../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const links: string[] = body?.links || []

  if (!links.length) {
    return []
  }

  // 构建占位符
  const placeholders = links.map(() => '?').join(',')
  const sql = `SELECT * FROM records WHERE link IN (${placeholders})`
  const rows = await query(sql, links)

  // 按传入 links 的顺序返回
  const rowMap = new Map((rows as RecordRow[]).map((r) => [r.link, toCamelCase(r)]))
  return links.map((link) => rowMap.get(link) || null).filter(Boolean)
})