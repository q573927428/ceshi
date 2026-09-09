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
  const search = String(queryParams.search || '').trim().slice(0, 100)
  let heroFilters: Array<{ heroId: number; name: string; minAdvance: number }> = []
  let skillFilters: string[] = []
  try {
    const parsed = JSON.parse(String(queryParams.heroes || '[]'))
    if (Array.isArray(parsed)) {
      heroFilters = parsed.slice(0, 20).map((item: any) => ({
        heroId: Math.trunc(Number(item?.heroId) || 0),
        name: String(item?.name || '').trim().slice(0, 100),
        minAdvance: Math.min(5, Math.max(0, Math.trunc(Number(item?.minAdvance) || 0))),
      })).filter((item) => item.heroId > 0 && item.name)
    }
  } catch { /* 无效筛选参数按空条件处理 */ }
  try {
    const parsed = JSON.parse(String(queryParams.skills || '[]'))
    if (Array.isArray(parsed)) {
      skillFilters = [...new Set(parsed.slice(0, 20)
        .map((item: any) => String(item || '').trim().slice(0, 100))
        .filter(Boolean))]
    }
  } catch { /* 无效筛选参数按空条件处理 */ }
  const isPageRequest = pageSize > 0

  const whereParts: string[] = []
  const whereParams: any[] = []
  if (user) {
    whereParts.push('user_id = ?')
    whereParams.push(user.id)
  }
  if (search) {
    const escapedSearch = search.replace(/[\\%_]/g, '\\$&')
    const indexedNamePrefix = `${escapedSearch}%`
    whereParts.push(`(
      LOCATE(?, link) > 0
      OR LOCATE(?, COALESCE(remark, '')) > 0
      OR LOCATE(?, COALESCE(user_remark, '')) > 0
      OR id IN (
        SELECT record_id FROM record_heroes WHERE hero_name LIKE ?
        UNION
        SELECT record_id FROM record_skills WHERE skill_name LIKE ?
        UNION
        SELECT record_id FROM record_weapons WHERE weapon_name LIKE ?
      )
    )`)
    whereParams.push(search, search, search, indexedNamePrefix, indexedNamePrefix, indexedNamePrefix)
  }
  for (const hero of heroFilters) {
    whereParts.push(`id IN (
      SELECT record_id FROM record_heroes
      WHERE hero_id = ? AND advance_num >= ?
    )`)
    whereParams.push(hero.heroId, hero.minAdvance)
  }
  for (const skill of skillFilters) {
    whereParts.push(`id IN (
      SELECT record_id FROM record_skills WHERE skill_name = ?
    )`)
    whereParams.push(skill)
  }
  const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''

  if (isPageRequest) {
    // 分页请求 - 返回指定页的完整记录（含 data）
    const offset = (page - 1) * pageSize
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT * FROM records ${whereSql} ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    )
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM records ${whereSql}`,
      whereParams
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
  const sql = `SELECT ${META_FIELDS} FROM records ${whereSql} ORDER BY timestamp DESC`
  const rows = await query(sql, whereParams)
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
