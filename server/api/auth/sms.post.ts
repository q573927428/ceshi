import { createSmsCode } from '../../utils/sms'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const phone = String(body?.phone || '').trim()
  if (!/^1\d{10}$/.test(phone)) throw createError({ statusCode: 400, message: '请输入正确的手机号' })
  await createSmsCode(phone)
  const configured = Boolean(process.env.ALIYUN_SMS_ACCESS_KEY_ID && process.env.ALIYUN_SMS_ACCESS_KEY_SECRET && process.env.ALIYUN_SMS_SIGN_NAME && process.env.ALIYUN_SMS_TEMPLATE_CODE)
  return { success: true, message: configured ? '验证码已发送' : '验证码已发送（开发环境验证码：123456）' }
})
