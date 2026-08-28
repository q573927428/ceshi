import crypto from 'node:crypto'
import { query, queryOne } from '../../db'
import { requireUser } from '../../utils/auth'

const plans: Record<string, { plan: string; quota: number; amountFen: number }> = {
  quota10: { plan: 'quota', quota: 10, amountFen: 100 }, quota100: { plan: 'quota', quota: 100, amountFen: 1000 }, pro30: { plan: 'pro', quota: 300, amountFen: 1990 },
}
export default defineEventHandler(async (event) => {
  const user = await requireUser(event); const body = await readBody(event); const p = plans[String(body?.planId)]
  if (!p) throw createError({ statusCode: 400, statusMessage: '套餐不存在' })
  const orderNo = `CBG${Date.now()}${crypto.randomBytes(3).toString('hex')}`
  await query('INSERT INTO payment_orders (order_no,user_id,plan,quota_increment,amount_fen) VALUES (?,?,?,?,?)', [orderNo, user.id, p.plan, p.quota, p.amountFen])
  if (!process.env.WECHAT_MCHID || !process.env.WECHAT_API_KEY || !process.env.WECHAT_APPID || !process.env.WECHAT_NOTIFY_URL) return { orderNo, status: 'pending_config', message: '微信支付参数未配置，请联系管理员' }
  return { orderNo, status: 'pending', message: '订单已创建，请在服务端接入微信统一下单并返回支付参数' }
})
