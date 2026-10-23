import { getCbgCookie } from '../../db'

export default defineEventHandler(async (event) => {
  const { ordersn } = getQuery(event)
  if (typeof ordersn !== 'string' || !ordersn) {
    throw createError({ statusCode: 400, message: 'ordersn is required' })
  }

  const apiBase = (process.env.CBG_API_BASE_URL || 'https://stzb.cbg.163.com').replace(/\/$/, '')
  const url = `${apiBase}/cgi/api/get_equip_detail?${new URLSearchParams({ client_type: 'h5', serverid: '1', ordersn })}`
  const cookie = await getCbgCookie()
  let data: any
  try {
    const response = await $fetch.raw(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        Referer: `https://stzb.cbg.163.com/cgi/mweb/equip/1/${encodeURIComponent(ordersn)}`,
        ...(cookie ? { Cookie: cookie } : {}),
      },
    })
    data = response._data
  } catch (error: any) {
    console.error('[equip/detail] upstream request failed', { ordersn, status: error?.response?.status })
    throw createError({ statusCode: 502, message: '无法访问藏宝阁接口，请检查服务器出口网络或配置 CBG_API_BASE_URL' })
  }

  if (data?.status !== 1) {
    const message = String(data?.msg || '')
    throw createError({
      statusCode: 502,
      statusMessage: String(data?.status_code || 'UPSTREAM_ERROR'),
      message: message || `藏宝阁API返回异常: status=${data?.status}`,
      data: { upstreamStatus: data?.status ?? null, upstreamStatusCode: data?.status_code ?? null, upstreamMessage: message || null },
    })
  }

  return {
    price: data?.equip?.price ?? null,
    area_name: data?.equip?.area_name ?? null,
    server_name: data?.equip?.server_name ?? null,
    status_desc: data?.equip?.status_desc ?? null,
    complex_highlights_v2: data?.equip?.complex_highlights_v2 ?? [],
  }
})
