<template>
  <section class="admin-page">
    <div class="page-heading">
      <div>
        <h2>藏宝阁 Cookie</h2>
        <p>用于服务端请求藏宝阁商品详情</p>
      </div>
      <el-tag :type="configured ? 'success' : 'info'">{{ configured ? '已配置' : '未配置' }}</el-tag>
    </div>

    <el-form label-position="top" class="cookie-form" @submit.prevent="saveCookie">
      <el-form-item label="Cookie">
        <el-input
          v-model="cookieInput"
          type="textarea"
          :rows="6"
          autocomplete="off"
          placeholder="粘贴藏宝阁请求中的 Cookie 字符串"
        />
      </el-form-item>
      <div class="actions">
        <el-button type="primary" :loading="saving" :disabled="!cookieInput.trim()" @click="saveCookie">保存 Cookie</el-button>
        <el-button :loading="saving" :disabled="!configured" @click="clearCookie">清除</el-button>
      </div>
    </el-form>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({ title: '藏宝阁 Cookie 设置 | 率土助手' })
const { user, load } = useAuth()
const configured = ref(false)
const cookieInput = ref('')
const saving = ref(false)

const loadStatus = async () => {
  const result = await $fetch<{ configured: boolean }>('/api/admin/cbg-cookie')
  configured.value = result.configured
}

const saveCookie = async () => {
  if (!cookieInput.value.trim()) return
  saving.value = true
  try {
    const result = await $fetch<{ configured: boolean }>('/api/admin/cbg-cookie', {
      method: 'PUT',
      body: { cookie: cookieInput.value.trim() },
    })
    configured.value = result.configured
    cookieInput.value = ''
    ElMessage.success('Cookie 已保存')
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const clearCookie = async () => {
  saving.value = true
  try {
    await $fetch('/api/admin/cbg-cookie', { method: 'PUT', body: { clear: true } })
    configured.value = false
    ElMessage.success('Cookie 已清除')
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '清除失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await load(true)
  if (!user.value?.isAdmin) {
    ElMessage.error('无管理员权限')
    await navigateTo('/')
    return
  }
  try {
    await loadStatus()
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '加载设置失败')
  }
})
</script>

<style scoped>
.admin-page { padding: 20px; }
.page-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
.page-heading h2 { margin: 0 0 6px; font-size: 20px; }
.page-heading p { margin: 0; color: #909399; font-size: 13px; }
.cookie-form { max-width: 760px; }
.actions { display: flex; gap: 8px; }
</style>
