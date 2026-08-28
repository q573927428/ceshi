import { requireUser, isAdminUser } from '../../utils/auth'
  export default defineEventHandler(async (event) => { const u = await requireUser(event); return { user: { id: u.id, username: u.username, phone: u.phone, nickname: u.nickname, plan: u.plan, quotaLimit: u.quota_limit, planExpiresAt: u.plan_expires_at, isAdmin: isAdminUser(u) } } })
