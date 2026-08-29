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
  const normalizePrice = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? Math.round(numberValue) : null
  }
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    // 锁住用户行，串行化同一用户的额度检查，避免并发请求同时通过 COUNT 检查。
    const [lockedUserRows] = await conn.execute('SELECT quota_limit FROM users WHERE id = ? FOR UPDATE', [user.id])
    const remainingQuota = Math.max(0, Number((lockedUserRows as any[])[0]?.quota_limit ?? 2))
    // 记录归属到当前用户；同一个藏宝阁 link 可以被多个用户分别保存。
    // 只在当前用户尚未保存该 link 时消耗额度，避免更新自己的记录重复扣额度。
    const [sameUserLinkRows] = await conn.execute(
      'SELECT id FROM records WHERE user_id = ? AND link = ? FOR UPDATE',
      [user.id, link]
    )
    const sameUserLink = (sameUserLinkRows as any[])[0]
    if (!sameUserLink) {
      if (remainingQuota <= 0) {
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
      normalizePrice(body.equipPrice),
      normalizePrice(body.estimatedPrice),
      body.statusDesc || '',
      body.remark || null,
      body.data ? JSON.stringify(body.data) : null,
      ]
    )
    if (!sameUserLink) await conn.execute('UPDATE users SET quota_limit = quota_limit - 1 WHERE id = ?', [user.id])
    await conn.commit()
    return { success: true, link, remaining: sameUserLink ? remainingQuota : remainingQuota - 1 }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

})
