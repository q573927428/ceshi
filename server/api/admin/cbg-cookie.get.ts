import { getCbgCookie } from '../../db'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setHeader(event, 'Cache-Control', 'no-store')
  return { configured: !!(await getCbgCookie()) }
})
