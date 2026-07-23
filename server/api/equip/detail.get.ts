export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ordersn = query.ordersn as string

  const cbgCookie = getHeader(event, 'x-cbg-cookie') || ''

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

  const data: any = await $fetch(url, { headers })

  if (data?.status === 2 && data?.status_code === 'SESSION_TIMEOUT') {
    throw createError({
      statusCode: 401,
      statusMessage: '藏宝阁需要登录，请先在浏览器中打开 https://stzb.cbg.163.com/ 并扫码登录，然后复制完整的Cookie字符串设置到工具中',
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
