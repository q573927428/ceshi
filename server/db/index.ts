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
  estimatedPrice: number | null
  statusDesc: string
  remark: string | null
  data: any
  createdAt: string
  updatedAt: string
}

export function toCamelCase(row: RecordRow): RecordOutput {
  return {
    id: row.id,
    user_id: row.user_id,
    link: row.link,
    timestamp: row.timestamp,
    isFavorite: !!row.is_favorite,
    equipPrice: row.equip_price,
    estimatedPrice: row.estimated_price,
    statusDesc: row.status_desc,
    remark: row.remark,
    data: row.data,
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