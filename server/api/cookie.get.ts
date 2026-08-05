import { getCbgCookie } from '../utils/cbgCookie'

export default defineEventHandler(async () => {
  const cookie = await getCbgCookie()
  return {
    cookie,
    hasCookie: !!cookie,
  }
})