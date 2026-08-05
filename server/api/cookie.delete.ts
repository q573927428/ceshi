import { clearCbgCookie } from '../utils/cbgCookie'

export default defineEventHandler(async () => {
  await clearCbgCookie()
  return { success: true }
})