import { query } from '../../db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const users = await query(`
    SELECT u.id, u.username, u.phone, u.nickname, u.plan, u.quota_limit,
           u.plan_expires_at, u.created_at,
           COUNT(r.id) AS used_count
    FROM users u
    LEFT JOIN records r ON r.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `)
  return { users: (users as any[]).map((u) => ({
    id: u.id,
    username: u.username,
    phone: u.phone,
    nickname: u.nickname,
    plan: u.plan,
    quotaLimit: Number(u.quota_limit),
    planExpiresAt: u.plan_expires_at,
    createdAt: u.created_at,
    usedCount: Number(u.used_count),
  })) }
})
