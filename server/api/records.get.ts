import { query, toCamelCase, getPool, type RecordRow } from '../db'

// 元数据字段列表（不含 data/raw_json 大字段）
const META_FIELDS = [
  'id', 'user_id', 'link', 'timestamp', 'is_favorite',
  'equip_price', 'estimated_price', 'status_desc', 'remark',
  'created_at', 'updated_at'
].join(', ')

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const page = parseInt(String(queryParams.page || '1'), 10)
  const pageSize = parseInt(String(queryParams.pageSize || '0'), 10)
  const isPageRequest = pageSize > 0

  if (isPageRequest) {
    // 分页请求 - 返回指定页的完整记录（含 data）
    const offset = (page - 1) * pageSize
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM records ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    )
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM records'
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
  const sql = `SELECT ${META_FIELDS} FROM records ORDER BY timestamp DESC`
  const rows = await query(sql)
  return (rows as RecordRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    link: row.link,
    timestamp: row.timestamp,
    isFavorite: !!row.is_favorite,
    equipPrice: row.equip_price,
    estimatedPrice: row.estimated_price,
    statusDesc: row.status_desc,
    remark: row.remark,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // data 字段不返回
  }))
})