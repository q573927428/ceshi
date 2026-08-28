import { query } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await query('DELETE FROM records WHERE user_id = ?', [user.id])
  return { success: true }
})
