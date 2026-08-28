import { query } from '../../db'
import { requireUser } from '../../utils/auth'

const MAX_BATCH_LINKS = 50

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ links?: string[] }>(event)
  const links = Array.from(new Set((body?.links || []).filter((x) => typeof x === 'string' && x.trim())))
  if (links.length > MAX_BATCH_LINKS) {
    throw createError({ statusCode: 413, message: `单次最多添加 ${MAX_BATCH_LINKS} 个账号` })
  }
  if (!links.length) return { allowedLinks: [], skippedLinks: [], existingLinks: [], remaining: Math.max(0, Number(user.quota_limit ?? 2)) }

  const placeholders = links.map(() => '?').join(',')
  const rows = await query(`SELECT link FROM records WHERE user_id = ? AND link IN (${placeholders})`, [user.id, ...links]) as any[]
  const existing = new Set(rows.map((r) => r.link))
  const countRows = await query('SELECT COUNT(*) AS total FROM records WHERE user_id = ?', [user.id])
  const quota = user.quota_limit == null ? 2 : Number(user.quota_limit)
  const remaining = Math.max(0, quota - Number(countRows[0]?.total || 0))
  const newLinks = links.filter((link) => !existing.has(link))
  const allowedNew = new Set(newLinks.slice(0, remaining))
  const allowedLinks = links.filter((link) => existing.has(link) || allowedNew.has(link))
  return { allowedLinks, skippedLinks: newLinks.slice(remaining), existingLinks: [...existing], remaining }
})
