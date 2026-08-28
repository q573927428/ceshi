import { query, queryOne } from '../../db'
export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event) || ''; const match = raw.match(/<out_trade_no><!\[CDATA\[(.*?)\]\]><\/out_trade_no>/); const orderNo = match?.[1]
  if (!orderNo) return '<xml><return_code><![CDATA[FAIL]]></return_code></xml>'
  const order: any = await queryOne('SELECT * FROM payment_orders WHERE order_no=?', [orderNo])
  if (order && order.status !== 'paid') { await query('UPDATE payment_orders SET status="paid", transaction_id=?, paid_at=NOW() WHERE order_no=?', ['wechat', orderNo]); await query('UPDATE users SET quota_limit=quota_limit+?, plan=IF(?="pro","pro",plan), plan_expires_at=IF(?="pro",DATE_ADD(COALESCE(plan_expires_at,NOW()), INTERVAL 30 DAY),plan_expires_at) WHERE id=?', [order.quota_increment, order.plan, order.plan, order.user_id]) }
  return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
})
