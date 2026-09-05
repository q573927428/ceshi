import { query, toCamelCase, getPool, type RecordRow } from '../db'
import { requireUser } from '../utils/auth'

// 元数据字段列表（不含 data/raw_json 大字段）
const META_FIELDS = [
  'id', 'user_id', 'link', 'timestamp', 'is_favorite',
    'equip_price', 'user_price', 'estimated_price', 'status_desc', 'remark', 'user_remark',
  'created_at', 'updated_at'
].join(', ')

export default defineEventHandler(async (event) => {
  // 浏览内容无需登录；写操作仍由各自接口强制校验登录。
  let user: any = null
  try { user = await requireUser(event) } catch { /* public read */ }
  const queryParams = getQuery(event)
  const page = parseInt(String(queryParams.page || '1'), 10)
  const pageSize = parseInt(String(queryParams.pageSize || '0'), 10)
  const isPageRequest = pageSize > 0

  if (isPageRequest) {
    // 分页请求 - 返回指定页的完整记录（含 data）
    const offset = (page - 1) * pageSize
    const pool = getPool()
    const [rows] = await pool.execute(
      user
        ? 'SELECT * FROM records WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?'
        : 'SELECT * FROM records ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      user ? [user.id, pageSize, offset] : [pageSize, offset]
    )
    const [countRows] = await pool.execute(
      user ? 'SELECT COUNT(*) as total FROM records WHERE user_id = ?' : 'SELECT COUNT(*) as total FROM records', user ? [user.id] : []
    )
    const total = (countRows as any[])[0]?.total || 0

    return {
      records: (rows as RecordRow[]).map(toCamelCase),
      total,
      page,
      pageSize,
    }
  }

  // 非分页请求 - 返回全部记录的元数据（不含 data）
  const sql = `SELECT ${META_FIELDS} FROM records ${user ? 'WHERE user_id = ?' : ''} ORDER BY timestamp DESC`
  const rows = await query(sql, user ? [user.id] : [])
  // 公开列表不去重：同一藏宝阁链接被不同用户保存时分别展示。
  return (rows as RecordRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    link: row.link,
    timestamp: row.timestamp,
    // 未登录时不暴露任何用户的收藏状态；登录用户仍只看到自己的记录。
    isFavorite: user ? !!row.is_favorite : false,
    equipPrice: row.equip_price,
    userPrice: row.user_price,
    estimatedPrice: row.estimated_price,
    statusDesc: row.status_desc,
    remark: row.remark,
    userRemark: row.user_remark,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // data 字段不返回
  }))
})
