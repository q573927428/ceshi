import crypto from 'node:crypto'

const store = new Map<string, { code: string; expires: number }>()
export function createSmsCode(phone: string) {
  const code = process.env.NODE_ENV === 'production' && process.env.ALIYUN_SMS_ACCESS_KEY_ID ? String(Math.floor(100000 + Math.random() * 900000)) : '123456'
  store.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })
  // 生产环境接入阿里云短信 SDK；当前不引入 SDK，避免把凭据写入代码。
  if (code === '123456') console.log(`[SMS MOCK] ${phone}: ${code}`)
  return code
}
export function verifySmsCode(phone: string, code: string) {
  const item = store.get(phone)
  const supplied = Buffer.from(String(code))
  if (!item || item.expires < Date.now() || supplied.length !== item.code.length || !crypto.timingSafeEqual(Buffer.from(item.code), supplied)) return false
  store.delete(phone)
  return true
}
