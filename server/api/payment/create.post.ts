import crypto from 'node:crypto'
import { query } from '../../db'
import { requireUser } from '../../utils/auth'

const plans: Record<string, { plan: string; quota: number; amountFen: number }> = {
  quota100: { plan: 'quota', quota: 100, amountFen: 1000 }, quota500: { plan: 'quota', quota: 500, amountFen: 5000 }, quota1000: { plan: 'quota', quota: 1000, amountFen: 10000 }, quota2000: { plan: 'quota', quota: 2000, amountFen: 20000 }, quota5000: { plan: 'quota', quota: 5000, amountFen: 50000 }, pro30: { plan: 'pro', quota: 300, amountFen: 1990 },
}

const WECHAT_UNIFIED_ORDER_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

function signParams(params: Record<string, string>, key: string) {
  const query = Object.keys(params)
    .filter(name => params[name] !== '' && params[name] !== undefined && params[name] !== null && name !== 'sign')
    .sort()
    .map(name => `${name}=${params[name]}`)
    .join('&')
  return crypto.createHash('md5').update(`${query}&key=${key}`).digest('hex').toUpperCase()
}

function toXml(params: Record<string, string>) {
  return `<xml>${Object.entries(params).map(([name, value]) => `<${name}><![CDATA[${value}]]></${name}>`).join('')}</xml>`
}

function readXml(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}><!\\[CDATA\\[(.*?)\\]\\]><\\/${name}>`)) || xml.match(new RegExp(`<${name}>(.*?)</${name}>`))
  return match?.[1] || ''
}

async function unifiedOrder(orderNo: string, plan: { plan: string; amountFen: number }, body: any, event: any) {
  const mchid = process.env.WECHAT_MCHID!
  const apiKey = process.env.WECHAT_API_KEY!
  const appid = process.env.WECHAT_APPID!
  const notifyUrl = process.env.WECHAT_NOTIFY_URL!
  const tradeType = String(body?.tradeType || process.env.WECHAT_TRADE_TYPE || 'NATIVE').toUpperCase()
  if (!['NATIVE', 'JSAPI'].includes(tradeType)) throw createError({ statusCode: 400, message: '不支持的微信支付类型' })
  const openid = String(body?.openid || process.env.WECHAT_OPENID || '')
  if (tradeType === 'JSAPI' && !openid) throw createError({ statusCode: 400, message: 'JSAPI 支付需要 openid' })
  const remoteIp = event.node?.req?.socket?.remoteAddress || '127.0.0.1'
  const params: Record<string, string> = {
    appid, mch_id: mchid, nonce_str: crypto.randomBytes(16).toString('hex'), body: `藏宝阁数据助手-${plan.plan === 'pro' ? '专业会员' : '金币充值'}`,
    out_trade_no: orderNo, total_fee: String(plan.amountFen), spbill_create_ip: remoteIp.replace(/^::ffff:/, ''), notify_url: notifyUrl, trade_type: tradeType,
  }
  if (tradeType === 'JSAPI') params.openid = openid
  params.sign = signParams(params, apiKey)
  const response = await fetch(WECHAT_UNIFIED_ORDER_URL, { method: 'POST', headers: { 'content-type': 'text/xml; charset=utf-8' }, body: toXml(params) })
  if (!response.ok) throw createError({ statusCode: 502, message: `微信统一下单请求失败（HTTP ${response.status}）` })
  const xml = await response.text()
  if (readXml(xml, 'return_code') !== 'SUCCESS' || readXml(xml, 'result_code') !== 'SUCCESS') throw createError({ statusCode: 502, message: readXml(xml, 'err_code_des') || readXml(xml, 'return_msg') || '微信统一下单失败' })
  const prepayId = readXml(xml, 'prepay_id')
  if (!prepayId) throw createError({ statusCode: 502, message: '微信未返回 prepay_id' })
  if (tradeType === 'NATIVE') return { tradeType, prepayId, codeUrl: readXml(xml, 'code_url') }
  const timeStamp = String(Math.floor(Date.now() / 1000)); const nonceStr = crypto.randomBytes(16).toString('hex'); const pkg = `prepay_id=${prepayId}`
  const paySign = signParams({ appId: appid, timeStamp, nonceStr, package: pkg, signType: 'MD5' }, apiKey)
  return { tradeType, prepayId, appId: appid, timeStamp, nonceStr, package: pkg, signType: 'MD5', paySign }
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event); const body = await readBody(event); const p = plans[String(body?.planId)]
  if (!p) throw createError({ statusCode: 400, message: '套餐不存在' })
  const orderNo = `CBG${Date.now()}${crypto.randomBytes(3).toString('hex')}`
  await query('INSERT INTO payment_orders (order_no,user_id,plan,quota_increment,amount_fen) VALUES (?,?,?,?,?)', [orderNo, user.id, p.plan, p.quota, p.amountFen])
  if (!process.env.WECHAT_MCHID || !process.env.WECHAT_API_KEY || !process.env.WECHAT_APPID || !process.env.WECHAT_NOTIFY_URL) return { orderNo, status: 'pending_config', message: '微信支付参数未配置，请联系管理员' }
  const payment = await unifiedOrder(orderNo, p, body, event)
  return { orderNo, status: 'pending', payment, ...payment }
})
