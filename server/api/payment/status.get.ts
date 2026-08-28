import { queryOne } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const orderNo = String(getQuery(event).orderNo || '').trim()
  if (!orderNo) throw createError({ statusCode: 400, message: '缺少订单号' })

  const order: any = await queryOne(
    'SELECT order_no, status, plan, quota_increment, amount_fen, transaction_id, paid_at FROM payment_orders WHERE order_no=? AND user_id=?',
    [orderNo, user.id],
  )
  if (!order) throw createError({ statusCode: 404, message: '订单不存在' })
  return { order }
})
