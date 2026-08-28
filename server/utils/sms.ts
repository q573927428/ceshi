import crypto from 'node:crypto'
import axios from 'axios'

const store = new Map<string, { code: string; expires: number }>()
const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

export async function createSmsCode(phone: string) {
  const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID
  const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET
  // 凭据存在即启用真实发送；不要依赖 NODE_ENV（直接运行 Nitro 时它可能未设置）。
  const production = Boolean(accessKeyId && accessKeySecret && process.env.ALIYUN_SMS_SIGN_NAME && process.env.ALIYUN_SMS_TEMPLATE_CODE)
  const code = production ? String(Math.floor(100000 + Math.random() * 900000)) : '123456'

  if (production) {
    const params: Record<string, string> = {
      AccessKeyId: accessKeyId!, Action: 'SendSms', Format: 'JSON', PhoneNumbers: phone,
      SignName: process.env.ALIYUN_SMS_SIGN_NAME || '', SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: crypto.randomUUID(), SignatureVersion: '1.0', Signature: '',
      TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '', TemplateParam: JSON.stringify({ code }),
      Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), Version: '2017-05-25'
    }
    const canonical = Object.keys(params).filter(k => k !== 'Signature').sort().map(k => `${encode(k)}=${encode(params[k])}`).join('&')
    const stringToSign = `GET&%2F&${encode(canonical)}`
    params.Signature = crypto.createHmac('sha1', `${accessKeySecret}&`).update(stringToSign).digest('base64')
    try {
      const response = await axios.get('https://dysmsapi.aliyuncs.com/', { params })
      if (response.data?.Code !== 'OK') throw new Error(response.data?.Message || response.data?.Code || '短信服务返回失败')
    } catch (error: any) {
      console.error('[SMS] Aliyun send failed:', error?.response?.data || error?.message || error)
      throw createError({ statusCode: 502, message: '短信发送失败，请稍后重试' })
    }
  } else {
    console.log(`[SMS MOCK] ${phone}: ${code}`)
  }

  store.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 })
  return code
}
export function verifySmsCode(phone: string, code: string) {
  const item = store.get(phone)
  const supplied = Buffer.from(String(code))
  if (!item || item.expires < Date.now() || supplied.length !== item.code.length || !crypto.timingSafeEqual(Buffer.from(item.code), supplied)) return false
  store.delete(phone)
  return true
}
