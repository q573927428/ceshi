import crypto from 'node:crypto'
import { queryOne } from '../db'

const COOKIE = 'cbg_session'
const SECRET = process.env.AUTH_SECRET || 'change-me-in-production'

function sign(value: string) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url')
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':')
  if (!salt || !expected) return false
  const actual = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
}

export const createPasswordHash = hashPassword

export function setSession(event: any, userId: number) {
  const payload = `${userId}.${Date.now()}`
  setCookie(event, COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' })
}

export function destroySession(event: any) { deleteCookie(event, COOKIE, { path: '/' }) }

export async function requireUser(event: any) {
  const token = getCookie(event, COOKIE)
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })
  const parts = token.split('.')
  if (parts.length < 3) throw createError({ statusCode: 401, message: '登录已失效' })
  const payload = parts.slice(0, 2).join('.')
  if (sign(payload) !== parts[2]) throw createError({ statusCode: 401, message: '登录已失效' })
  const user = await queryOne('SELECT id, username, phone, nickname, plan, quota_limit, plan_expires_at FROM users WHERE id = ?', [Number(parts[0])])
  if (!user) throw createError({ statusCode: 401, message: '用户不存在' })
  return user
}

export const sessionCookieName = COOKIE
