import { query } from '../../db'

export default defineEventHandler(async (event) => {
  const rawLink = event.context.params?.link
  if (!rawLink) {
    throw createError({ statusCode: 400, statusMessage: 'link is required' })
  }
  const link = decodeURIComponent(rawLink)
  await query('DELETE FROM records WHERE link = ?', [link])
  return { success: true }
})