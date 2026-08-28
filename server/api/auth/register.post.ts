import { query } from '../../db'
import { createPasswordHash, setSession, isAdminUser } from '../../utils/auth'
import { verifySmsCode } from '../../utils/sms'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = String(body?.username || '').trim()
  const password = String(body?.password || '')
  const phone = String(body?.phone || '').trim()
  const code = String(body?.code || '').trim()
  if (!/^[\w.-]{3,30}$/.test(username) || password.length < 6) throw createError({ statusCode: 400, message: '用户名至少3位，密码至少6位' })
  if (!/^1\d{10}$/.test(phone) || !verifySmsCode(phone, code)) throw createError({ statusCode: 400, message: '手机号验证码错误或已过期' })
  try {
    const result: any = await query('INSERT INTO users (username, phone, password_hash, plan, quota_limit) VALUES (?, ?, ?, "free", 2)', [username, phone, createPasswordHash(password)])
    setSession(event, result.insertId)
    return { user: { id: result.insertId, username, phone, plan: 'free', quotaLimit: 2, isAdmin: isAdminUser({ username }) } }
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') throw createError({ statusCode: 409, message: '用户名或手机号已存在' })
    throw e
  }
})
