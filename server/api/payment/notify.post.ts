import { query, queryOne } from '../../db'
export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event) || ''
  const read = (name: string) => raw.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${name}>`))?.[1] || ''
  const orderNo = read('out_trade_no')
  if (!orderNo) return '<xml><return_code><![CDATA[FAIL]]></return_code></xml>'
  const order: any = await queryOne('SELECT * FROM payment_orders WHERE order_no=?', [orderNo])
  if (order && order.status !== 'paid' && read('result_code') === 'SUCCESS' && read('return_code') === 'SUCCESS') {
    const transactionId = read('transaction_id') || 'wechat'
    const updated: any = await query('UPDATE payment_orders SET status="paid", transaction_id=?, paid_at=NOW() WHERE order_no=? AND status<>"paid"', [transactionId, orderNo])
    // 只有抢到状态变更的通知才发放权益，防止并发/重复回调重复加额度。
    if (Number(updated?.affectedRows ?? updated?.[0]?.affectedRows) === 1) {
      await query('UPDATE users SET quota_limit=quota_limit+?, plan=IF(?="pro","pro",plan), plan_expires_at=IF(?="pro",DATE_ADD(COALESCE(plan_expires_at,NOW()), INTERVAL 30 DAY),plan_expires_at) WHERE id=?', [order.quota_increment, order.plan, order.plan, order.user_id])
    }
  }
  return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
})
