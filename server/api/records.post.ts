import { getPool } from '../db'
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
    throw createError({ statusCode: 400, message: 'link is required' })
  }
  const link = body.link.trim()
  if (!/^\d{15}-1-[A-Z0-9]{14}$/i.test(link) || link.length > 100) {
    throw createError({ statusCode: 400, message: 'link 格式无效' })
  }

  const timestamp = body.timestamp || Date.now()
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    // 锁住用户行，串行化同一用户的额度检查，避免并发请求同时通过 COUNT 检查。
    await conn.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [user.id])
    // 记录归属到当前用户；同一个藏宝阁 link 可以被多个用户分别保存。
    // 只在当前用户尚未保存该 link 时消耗额度，避免更新自己的记录重复扣额度。
    const [sameUserLinkRows] = await conn.execute(
      'SELECT id FROM records WHERE user_id = ? AND link = ? FOR UPDATE',
      [user.id, link]
    )
    const sameUserLink = (sameUserLinkRows as any[])[0]
    if (!sameUserLink) {
      const [countRows] = await conn.execute('SELECT COUNT(*) AS total FROM records WHERE user_id = ?', [user.id])
      const quota = user.quota_limit == null ? 2 : Number(user.quota_limit)
      if (Number((countRows as any[])[0]?.total || 0) >= quota) {
        throw createError({ statusCode: 402, message: '金币不足，请充值后继续添加' })
      }
    }

    await conn.execute(
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
      link,
      timestamp,
      body.isFavorite ? 1 : 0,
      body.equipPrice ?? null,
      body.estimatedPrice ?? null,
      body.statusDesc || '',
      body.remark || null,
      body.data ? JSON.stringify(body.data) : null,
      ]
    )
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return { success: true, link }
})
