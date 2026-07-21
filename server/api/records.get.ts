import { query, toCamelCase, type RecordRow } from '../db'

export default defineEventHandler(async () => {
  const rows = await query('SELECT * FROM records ORDER BY timestamp DESC')
  return (rows as RecordRow[]).map(toCamelCase)
})