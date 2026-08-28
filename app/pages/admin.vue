<template>
  <section class="admin-page">
    <div class="page-heading">
      <div>
        <h2>用户管理</h2>
        <p>管理用户金币额度与会员类型</p>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="loadUsers">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="users" stripe border>
      <el-table-column prop="username" label="用户名" min-width="150" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column label="已用账号数" width="120">
        <template #default="{ row }">{{ row.usedCount }}</template>
      </el-table-column>
      <el-table-column label="剩余金币" width="220">
        <template #default="{ row }">
          <el-input-number v-model="row.quotaLimit" :min="0" :step="1" controls-position="right" />
        </template>
      </el-table-column>
      <el-table-column label="会员类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.plan">
            <el-option label="普通用户" value="free" />
            <el-option label="专业会员" value="pro" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="专业会员到期" width="260">
        <template #default="{ row }">
          <el-date-picker v-model="row.planExpiresAt" type="date" value-format="YYYY-MM-DD" placeholder="不限期" :disabled="row.plan !== 'pro'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :loading="savingId === row.id" @click="saveUser(row)">保存</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'

interface AdminUser {
  id: number
  username: string
  phone: string | null
  usedCount: number
  quotaLimit: number
  plan: 'free' | 'pro'
  planExpiresAt: string | null
}

const { user, load: loadAuth } = useAuth()
const users = ref<AdminUser[]>([])
const loading = ref(false)
const savingId = ref<number | null>(null)

const loadUsers = async () => {
  loading.value = true
  try {
    const result = await $fetch<{ users: AdminUser[] }>('/api/admin/users')
    users.value = result.users
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '加载用户失败')
  } finally {
    loading.value = false
  }
}

const saveUser = async (row: AdminUser) => {
  savingId.value = row.id
  try {
    await $fetch('/api/admin/users', {
      method: 'PATCH',
      body: { userId: row.id, quotaLimit: row.quotaLimit, plan: row.plan, planExpiresAt: row.planExpiresAt },
    })
    ElMessage.success('用户信息已更新')
    await loadUsers()
    if (row.id === user.value?.id) await loadAuth(true)
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '更新用户失败')
  } finally {
    savingId.value = null
  }
}

onMounted(async () => {
  await loadAuth()
  if (!user.value?.isAdmin) {
    ElMessage.error('无管理员权限')
    await navigateTo('/')
    return
  }
  await loadUsers()
})
</script>

<style scoped>
.admin-page { padding: 24px; }
.page-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.page-heading h2 { margin: 0 0 6px; color: #303133; }
.page-heading p { margin: 0; color: #909399; font-size: 13px; }
</style>
