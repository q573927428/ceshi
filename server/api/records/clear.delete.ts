import { query } from '../../db'

export default defineEventHandler(async () => {
  await query('DELETE FROM records')
  return { success: true }
})