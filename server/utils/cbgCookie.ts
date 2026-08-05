// utils/cbgCookie.ts
// 藏宝阁 Cookie 服务端管理：存储、读取、自动续期（合并 Set-Cookie）
import { queryOne, query } from '../db'

/**
 * 解析 Set-Cookie 响应头为 cookie 键值对对象
 * 处理格式：`name=value; Path=/; HttpOnly` 或 `name=value, name2=value2`
 */
function parseSetCookies(setCookie: string[] | string | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!setCookie) return result

  const headers = Array.isArray(setCookie) ? setCookie : [setCookie]

  // 第一条 Set-Cookie 可能包含逗号分隔的多个 cookie（某些 CDN 行为）
  headers.forEach((header) => {
    // 跳过 Date/Expires 等带逗号的属性，拆分为独立的 cookie 声明
    const parts = header.split(/,(?=\s*[^;=\s]+=[^;=\s]*)/)
    parts.forEach((part: string) => {
      const eqIdx = part.indexOf('=')
      if (eqIdx <= 0) return
      const name = part.slice(0, eqIdx).trim()
      const value = part.slice(eqIdx + 1).split(';')[0]?.trim() || ''
      // 判断是否通过 HttpOnly 标记识别为删除操作（值为空）
      if (!value && /;\s*expires=/i.test(part)) {
        return // 过期删除类 cookie 跳过
      }
      if (name) result[name] = value
    })
  })

  return result
}

/**
 * 将完整 cookie 字符串解析为 {name: value} 对象
 */
function parseCookieString(cookieStr: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!cookieStr) return result
  cookieStr.split(';').forEach((pair) => {
    const eqIdx = pair.indexOf('=')
    if (eqIdx <= 0) return
    const name = pair.slice(0, eqIdx).trim()
    const value = pair.slice(eqIdx + 1).trim()
    if (name) result[name] = value
  })
  return result
}

/**
 * 将 cookie 对象序列化为完整 cookie 字符串
 */
function serializeCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

/** 读取当前保存的藏宝阁 Cookie */
export async function getCbgCookie(): Promise<string> {
  const row = await queryOne('SELECT cookie FROM cbg_session WHERE id = 1')
  return row?.cookie || ''
}

/**
 * 保存/更新藏宝阁 Cookie
 */
export async function saveCbgCookie(cookie: string): Promise<void> {
  await query('INSERT INTO cbg_session (id, cookie) VALUES (1, ?) ON DUPLICATE KEY UPDATE cookie = ?', [cookie, cookie])
}

/**
 * 合并 Set-Cookie 到已保存的 Cookie 中（自动续期 login_id 等滚动会话 cookie）
 * 返回更新后的完整 cookie 字符串
 */
export async function mergeSetCookies(setCookie: string[] | string | undefined): Promise<string> {
  const updates = parseSetCookies(setCookie)
  const keys = Object.keys(updates)
  if (keys.length === 0) return getCbgCookie()

  const current = await getCbgCookie()
  const merged = { ...parseCookieString(current), ...updates }
  const newCookie = serializeCookies(merged)
  await saveCbgCookie(newCookie)
  return newCookie
}

/** 清除保存的藏宝阁 Cookie */
export async function clearCbgCookie(): Promise<void> {
  await query('UPDATE cbg_session SET cookie = \'\' WHERE id = 1')
}