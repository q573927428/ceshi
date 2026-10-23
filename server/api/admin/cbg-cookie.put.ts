import { ensureAppSettings, query } from '../../db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setHeader(event, 'Cache-Control', 'no-store')
  await ensureAppSettings()
  const body = await readBody<{ cookie?: string; clear?: boolean }>(event)
  const cookie = String(body?.cookie || '').trim()
  if (body?.clear) {
    await query('DELETE FROM app_settings WHERE setting_key = ?', ['cbg_cookie'])
    return { configured: false }
  }
  if (!cookie || cookie.length > 16000 || /[^\x20-\x7e]/.test(cookie) || !cookie.includes('=')) {
    throw createError({ statusCode: 400, message: '请输入有效的 Cookie 字符串' })
  }
  await query('INSERT INTO app_settings (setting_key, cookie_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE cookie_value = VALUES(cookie_value)', ['cbg_cookie', cookie])
  return { configured: true }
})
