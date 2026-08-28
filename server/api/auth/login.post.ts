import { queryOne } from '../../db'
import { setSession, verifyPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = await queryOne('SELECT * FROM users WHERE username = ?', [String(body?.username || '').trim()])
  if (!user || !verifyPassword(String(body?.password || ''), user.password_hash)) throw createError({ statusCode: 401, message: '用户名或密码错误' })
  setSession(event, user.id)
  return { user: { id: user.id, username: user.username, phone: user.phone, nickname: user.nickname, plan: user.plan, quotaLimit: user.quota_limit, planExpiresAt: user.plan_expires_at } }
})
