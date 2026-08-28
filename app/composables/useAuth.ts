import { ref, computed } from 'vue'

const user = ref<any>(null)
const initialized = ref(false)

export const useAuth = () => {
  const loading = ref(false)
  const error = ref('')
  const load = async () => { if (initialized.value) return; try { const r: any = await $fetch('/api/auth/me'); user.value = r.user } catch {} finally { initialized.value = true } }
  const login = async (username: string, password: string) => { loading.value = true; error.value = ''; try { const r: any = await $fetch('/api/auth/login', { method: 'POST', body: { username, password } }); user.value = r.user } catch (e: any) { error.value = e?.data?.message || e?.data?.statusMessage || '登录失败'; throw e } finally { loading.value = false } }
  const register = async (username: string, password: string, phone: string, code: string) => { loading.value = true; error.value = ''; try { const r: any = await $fetch('/api/auth/register', { method: 'POST', body: { username, password, phone, code } }); user.value = r.user } catch (e: any) { error.value = e?.data?.message || e?.data?.statusMessage || '注册失败'; throw e } finally { loading.value = false } }
  const logout = async () => { await $fetch('/api/auth/logout', { method: 'POST' }); user.value = null }
  return { user, initialized, loading, error, load, login, register, logout, isLoggedIn: computed(() => !!user.value) }
}
