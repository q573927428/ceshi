import { query } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const rawLink = event.context.params?.link
  if (!rawLink) {
    throw createError({ statusCode: 400, message: 'link is required' })
  }
  const link = decodeURIComponent(rawLink)
  const user = await requireUser(event)
  await query('DELETE FROM records WHERE link = ? AND user_id = ?', [link, user.id])
  return { success: true }
})
