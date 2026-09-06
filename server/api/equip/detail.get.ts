export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ordersn = query.ordersn as string
  if (!ordersn) {
    throw createError({ statusCode: 400, message: 'ordersn is required' })
  }

  // 可通过兼容藏宝阁接口的出口代理访问，避免服务器公网 IP 被上游风控拦截。
  const apiBase = (process.env.CBG_API_BASE_URL || 'https://stzb.cbg.163.com').replace(/\/$/, '')

  const url =
    `${apiBase}/cgi/api/get_equip_detail?` +
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

  let res: any
  try {
    res = await $fetch.raw(url, { headers })
  } catch (error: any) {
    console.error('[equip/detail] upstream request failed', {
      ordersn,
      status: error?.response?.status,
      message: error?.message,
    })
    throw createError({ statusCode: 502, message: '无法访问藏宝阁接口，请检查服务器出口网络或配置 CBG_API_BASE_URL' })
  }

  const data = res._data

  if (data?.status !== 1) {
    const upstreamMessage = String(data?.msg || '')
    throw createError({
      statusCode: 502,
      statusMessage: String(data?.status_code || 'UPSTREAM_ERROR'),
      message: upstreamMessage || `藏宝阁API返回异常: status=${data?.status}`,
      data: {
        upstreamStatus: data?.status ?? null,
        upstreamStatusCode: data?.status_code ?? null,
        upstreamMessage: upstreamMessage || null,
      },
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
