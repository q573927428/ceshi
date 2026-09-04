import { query, toCamelCase, type RecordRow } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  let user: any = null
  try { user = await requireUser(event) } catch { /* public read */ }
  const body = await readBody(event)
  const links: string[] = body?.links || []

  if (!links.length) {
    return []
  }

  // 构建占位符
  const placeholders = links.map(() => '?').join(',')
  const sql = `SELECT * FROM records WHERE ${user ? 'user_id = ? AND ' : ''}link IN (${placeholders}) ORDER BY timestamp DESC`
  const rows = await query(sql, user ? [user.id, ...links] : links)

  // 按传入 links 的顺序返回
  const rowMap = new Map((rows as RecordRow[]).map((r) => {
    const record: any = toCamelCase(r)
    if (!user) record.isFavorite = false
    return [r.link, record]
  }))
  return links.map((link) => rowMap.get(link) || null).filter(Boolean)
})
