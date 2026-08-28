import { clearSession } from '../../utils/auth'
export default defineEventHandler(async (event) => { clearSession(event); return { success: true } })
