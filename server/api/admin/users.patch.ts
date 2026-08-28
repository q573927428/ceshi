import { query, queryOne } from '../../db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const userId = Number(body?.userId)
  const quotaLimit = Number(body?.quotaLimit)
  const plan = String(body?.plan || '')
  if (!Number.isInteger(userId) || userId <= 0) throw createError({ statusCode: 400, message: '用户无效' })
  if (!Number.isInteger(quotaLimit) || quotaLimit < 0) throw createError({ statusCode: 400, message: '金币额度必须是非负整数' })
  if (!['free', 'pro'].includes(plan)) throw createError({ statusCode: 400, message: '会员类型无效' })

  const target = await queryOne('SELECT id, username FROM users WHERE id = ?', [userId])
  if (!target) throw createError({ statusCode: 404, message: '用户不存在' })
  const countRow: any = await queryOne('SELECT COUNT(*) AS total FROM records WHERE user_id = ?', [userId])
  if (quotaLimit < Number(countRow?.total || 0)) throw createError({ statusCode: 400, message: '金币额度不能低于已添加账号数' })

  const expiresAt = plan === 'pro' ? (body?.planExpiresAt || null) : null
  await query('UPDATE users SET quota_limit = ?, plan = ?, plan_expires_at = ? WHERE id = ?', [quotaLimit, plan, expiresAt, userId])
  return { success: true }
})
