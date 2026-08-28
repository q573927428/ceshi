import { query } from '../db'
import { requireUser } from '../utils/auth'

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
  const user = await requireUser(event)
  const body = await readBody<RecordBody>(event)
  if (!body?.link) {
    throw createError({ statusCode: 400, statusMessage: 'link is required' })
  }

  const timestamp = body.timestamp || Date.now()

  const existing = await query('SELECT id FROM records WHERE link = ? AND user_id = ?', [body.link, user.id])
  if (!existing.length) {
    const count = await query('SELECT COUNT(*) AS total FROM records WHERE user_id = ?', [user.id])
    if (Number(count[0]?.total || 0) >= Number(user.quota_limit || 2)) throw createError({ statusCode: 402, statusMessage: '金币不足，请充值后继续添加' })
  }

  await query(
    `INSERT INTO records (user_id, link, timestamp, is_favorite, equip_price, estimated_price, status_desc, remark, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       timestamp = VALUES(timestamp),
       is_favorite = VALUES(is_favorite),
       equip_price = VALUES(equip_price),
       estimated_price = VALUES(estimated_price),
       status_desc = VALUES(status_desc),
       remark = VALUES(remark),
       data = VALUES(data)`,
    [
      user.id,
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
