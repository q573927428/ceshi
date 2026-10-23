import mysql from 'mysql2/promise'
import { dbConfig } from './config'

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export interface RecordRow {
  id: number
  user_id: number | null
  link: string
  timestamp: number
  is_favorite: number
  equip_price: number | null
  user_price: number | null
  user_remark: string | null
  estimated_price: number | null
  status_desc: string
  remark: string | null
  data: any
  raw_json: any
  created_at: string
  updated_at: string
}

export interface RecordOutput {
  id: number
  user_id: number | null
  link: string
  timestamp: number
  isFavorite: boolean
  equipPrice: number | null
  userPrice: number | null
  userRemark: string | null
  estimatedPrice: number | null
  statusDesc: string
  remark: string | null
  data: any
  createdAt: string
  updatedAt: string
}

export function toCamelCase(row: RecordRow): RecordOutput {
  let parsedData = row.data
  // MySQL JSON 类型返回时可能是字符串，需要反序列化
  if (typeof parsedData === 'string') {
    try {
      parsedData = JSON.parse(parsedData)
    } catch {
      parsedData = null
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    link: row.link,
    timestamp: row.timestamp,
    isFavorite: !!row.is_favorite,
    equipPrice: row.equip_price,
    userPrice: row.user_price,
    userRemark: row.user_remark,
    estimatedPrice: row.estimated_price,
    statusDesc: row.status_desc,
    remark: row.remark,
    data: parsedData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows as any[]
}

export async function queryOne(sql: string, params: any[] = []): Promise<any> {
  const rows = await query(sql, params)
  return rows[0] || null
}

export async function ensureAppSettings(): Promise<void> {
  await query(`CREATE TABLE IF NOT EXISTS app_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    cookie_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`)
}

export async function getCbgCookie(): Promise<string> {
  await ensureAppSettings()
  const row = await queryOne('SELECT cookie_value FROM app_settings WHERE setting_key = ?', ['cbg_cookie'])
  return row?.cookie_value || ''
}
