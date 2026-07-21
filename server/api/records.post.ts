import { query } from '../db'

interface RecordBody {
  link: string
  timestamp?: number
  isFavorite?: boolean
  equipPrice?: number | null
  estimatedPrice?: number | null
  statusDesc?: string
  remark?: string | null
  data?: any
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RecordBody>(event)
  if (!body?.link) {
    throw createError({ statusCode: 400, statusMessage: 'link is required' })
  }

  const timestamp = body.timestamp || Date.now()

  await query(
    `INSERT INTO records (link, timestamp, is_favorite, equip_price, estimated_price, status_desc, remark, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       timestamp = VALUES(timestamp),
       is_favorite = VALUES(is_favorite),
       equip_price = VALUES(equip_price),
       estimated_price = VALUES(estimated_price),
       status_desc = VALUES(status_desc),
       remark = VALUES(remark),
       data = VALUES(data)`,
    [
      body.link,
      timestamp,
      body.isFavorite ? 1 : 0,
      body.equipPrice ?? null,
      body.estimatedPrice ?? null,
      body.statusDesc || '',
      body.remark || null,
      body.data ? JSON.stringify(body.data) : null,
    ]
  )

  return { success: true, link: body.link }
})