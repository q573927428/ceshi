export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url =
    'https://stzb.cbg.163.com/cgi/api/get_equip_detail?' +
    new URLSearchParams({
      client_type: 'h5',
      serverid: 1,
      ordersn: query.ordersn
    })

  const data = await $fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
  })

  return {
    price: data?.equip?.price ?? null,
    area_name: data?.equip?.area_name ?? null,
    server_name: data?.equip?.server_name ?? null,
    status_desc: data?.equip?.status_desc ?? null
  }
})
