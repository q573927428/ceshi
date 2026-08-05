import { getCbgCookie, mergeSetCookies, saveCbgCookie } from '../../utils/cbgCookie'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ordersn = query.ordersn as string

  // 兼容旧版前端：请求头携带的 cookie 优先使用，并同步到数据库
  const headerCookie = getHeader(event, 'x-cbg-cookie') || ''
  let cbgCookie = headerCookie || (await getCbgCookie())
  if (headerCookie) {
    await saveCbgCookie(headerCookie).catch(() => {})
  }

  const url =
    'https://stzb.cbg.163.com/cgi/api/get_equip_detail?' +
    new URLSearchParams({
      client_type: 'h5',
      serverid: '1',
      ordersn,
    })

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Referer': `https://stzb.cbg.163.com/cgi/mweb/equip/1/${ordersn}`,
  }

  if (cbgCookie) {
    headers['Cookie'] = cbgCookie
  }

  const res: any = await $fetch.raw(url, { headers })

  // 捕获 Set-Cookie 并自动合并续期（login_id 等滚动会话 cookie）
  const setCookie = res.headers?.getSetCookie
    ? res.headers.getSetCookie()
    : res.headers?.get('set-cookie')
      ? [res.headers.get('set-cookie')]
      : null
  if (setCookie?.length) {
    await mergeSetCookies(setCookie).catch(() => {})
  }

  const data = res._data

  if (data?.status === 2 && data?.status_code === 'SESSION_TIMEOUT') {
    throw createError({
      statusCode: 401,
      statusMessage: '藏宝阁需要登录，请先在浏览器中打开 https://stzb.cbg.163.com/ 并扫码登录，然后到「Cookie设置」页面粘贴新的Cookie字符串保存',
    })
  }

  if (data?.status !== 1) {
    throw createError({
      statusCode: 500,
      statusMessage: data?.msg || `藏宝阁API返回异常: status=${data?.status}`,
    })
  }

  return {
    price: data?.equip?.price ?? null,
    area_name: data?.equip?.area_name ?? null,
    server_name: data?.equip?.server_name ?? null,
    status_desc: data?.equip?.status_desc ?? null,
  }
})