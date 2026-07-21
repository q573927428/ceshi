import { queryOne, toCamelCase, type RecordRow } from '../../db'

export default defineEventHandler(async (event) => {
  const rawLink = event.context.params?.link
  if (!rawLink) return null
  const link = decodeURIComponent(rawLink)
  const row = await queryOne('SELECT * FROM records WHERE link = ?', [link]) as RecordRow | null
  if (!row) return null
  return toCamelCase(row)
})