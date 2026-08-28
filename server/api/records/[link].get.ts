import { queryOne, toCamelCase, type RecordRow } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const rawLink = event.context.params?.link
  if (!rawLink) return null
  const link = decodeURIComponent(rawLink)
  const user = await requireUser(event)
  const row = await queryOne('SELECT * FROM records WHERE link = ? AND user_id = ?', [link, user.id]) as RecordRow | null
  if (!row) return null
  return toCamelCase(row)
})
