import { queryOne, toCamelCase, type RecordRow } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const rawLink = event.context.params?.link
  if (!rawLink) return null
  const link = decodeURIComponent(rawLink)
  let user: any = null
  try { user = await requireUser(event) } catch { /* public read */ }
  const row = await queryOne(
    user ? 'SELECT * FROM records WHERE link = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1' : 'SELECT * FROM records WHERE link = ? ORDER BY timestamp DESC LIMIT 1',
    user ? [link, user.id] : [link]
  ) as RecordRow | null
  if (!row) return null
  return toCamelCase(row)
})
