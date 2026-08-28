export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ordersn = query.ordersn as string

  const url =
    'https://stzb.cbg.163.com/cgi/api/get_equip_detail?' +
    new URLSearchParams({
      client_type: 'h5',
      serverid: '1',
      ordersn,
    })

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Referer': `https://stzb.cbg.163.com/cgi/mweb/equip/1/${ordersn}`,
  }

  const res: any = await $fetch.raw(url, { headers })

  const data = res._data

  if (data?.status !== 1) {
    throw createError({
      statusCode: 500,
      message: data?.msg || `藏宝阁API返回异常: status=${data?.status}`,
    })
  }

  return {
    price: data?.equip?.price ?? null,
    area_name: data?.equip?.area_name ?? null,
    server_name: data?.equip?.server_name ?? null,
    status_desc: data?.equip?.status_desc ?? null,
    // 账号亮点由前端转换为默认备注
    complex_highlights_v2: data?.equip?.complex_highlights_v2 ?? [],
  }
})
