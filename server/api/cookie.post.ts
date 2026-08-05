import { saveCbgCookie } from '../utils/cbgCookie'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const cookie = (body?.cookie || '').trim()
  if (!cookie) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cookie不能为空',
    })
  }
  await saveCbgCookie(cookie)
  return { success: true }
})