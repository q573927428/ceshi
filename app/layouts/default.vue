<template>
  <el-container class="admin-container">
    <!-- 左侧边栏 -->
    <el-aside v-if="!isAuthPage"
      v-show="!isCollapse || isDesktop"
      :width="isDesktop ? (isCollapse ? '64px' : '200px') : '200px'"
      class="admin-aside"
      :class="{ 'aside-overlay': !isDesktop }"
    >
      <AppHeader :is-collapse="isDesktop && isCollapse" :is-admin="user?.isAdmin" :is-logged-in="isLoggedIn" @toggle="toggleSidebar" />
    </el-aside>

    <!-- 移动端遮罩 -->
    <div
      v-if="!isDesktop && !isCollapse"
      class="aside-mask"
      @click="isCollapse = true"
    ></div>

    <!-- 右侧内容区 -->
    <el-container class="admin-main-area">
      <!-- 顶部 header -->
      <el-header v-if="!isAuthPage" class="admin-header" height="50px">
        <div class="header-left">
          <el-button text @click="toggleSidebar" style="font-size: 18px;">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <!-- <span class="header-title">藏宝阁助手</span> -->
        </div>
        <div class="header-right">
          <template v-if="isLoggedIn">
            <el-tag class="user-name" effect="plain" size="small">{{ user.username }}</el-tag>
            <el-tag class="quota-badge" :type="user.plan === 'free' ? 'info' : 'warning'" effect="plain" size="small" title="金币余额" aria-label="金币余额">
              <el-icon class="quota-icon" aria-hidden="true"><Coin /></el-icon>
               {{ user.quotaLimit }}
            </el-tag>
            <el-button text size="small" title="退出登录" aria-label="退出登录" @click="logout">
              <el-icon><SwitchButton /></el-icon>
            </el-button>
          </template>
          <template v-else>
            <el-button text size="small" @click="goToLogin">登录</el-button>
            <el-button text size="small" @click="goToRegister">注册</el-button>
          </template>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="admin-main">
        <NuxtPage />
      </el-main>
    </el-container>

    <!-- 返回顶部按钮 -->
    <BackToTop />

    <el-dialog v-if="false" v-model="authVisible" title="登录藏宝阁助手" width="360px" :close-on-click-modal="false">
      <el-input v-model="authForm.username" placeholder="用户名" class="auth-input" />
      <el-input v-model="authForm.password" type="password" show-password placeholder="密码（至少6位）" class="auth-input" />
      <div v-if="authError" class="auth-error">{{ authError }}</div>
      <template #footer><el-button @click="toggleAuthMode">{{ authMode === 'login' ? '注册账号' : '返回登录' }}</el-button><el-button type="primary" :loading="authLoading" @click="submitAuth">{{ authMode === 'login' ? '登录' : '注册并登录' }}</el-button></template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Coin, Fold, Expand, SwitchButton } from '@element-plus/icons-vue'
import { useAuth } from '~/composables/useAuth'
import { useDb } from '~/composables/useDb'
import { useRoute } from 'vue-router'

const isCollapse = ref(false)
const windowWidth = ref(1024)

const isDesktop = computed(() => windowWidth.value > 768)
const isAuthPage = computed(() => ['/login', '/register'].includes(useRoute().path))
const { user, isLoggedIn, load, login, register, logout: authLogout, loading: authLoading, error: authError } = useAuth()
const { loadAllRecords } = useDb()
const authVisible = ref(false)
const authMode = ref<'login'|'register'>('login')
const authForm = ref({ username: '', password: '' })
const usedCount = ref(0)
const goToLogin = () => navigateTo('/login')
const goToRegister = () => navigateTo('/register')
const toggleAuthMode = () => { authMode.value = authMode.value === 'login' ? 'register' : 'login' }
const logout = async () => { await authLogout(); usedCount.value = 0; window.location.reload() }
const submitAuth = async () => { try { if (authMode.value === 'login') await login(authForm.value.username, authForm.value.password); authVisible.value = false; usedCount.value = (await loadAllRecords()).length } catch {} }

const onRecordsCountChanged = (event: Event) => {
  const detail = (event as CustomEvent<{ count?: number; remaining?: number }>).detail
  const count = detail?.count
  if (typeof count === 'number') usedCount.value = count
  if (typeof detail?.remaining === 'number' && user.value) user.value.quotaLimit = detail.remaining
}

// 登录页完成登录后布局不会重新挂载，需要在登录状态变化时同步一次使用量。
watch(isLoggedIn, async (loggedIn) => {
  if (loggedIn) usedCount.value = (await loadAllRecords()).length
  else usedCount.value = 0
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const onResize = () => {
  windowWidth.value = window.innerWidth
  // 桌面端默认展开，移动端默认折叠
  if (windowWidth.value > 768 && isCollapse.value) {
    isCollapse.value = false
  }
}

onMounted(() => {
  window.addEventListener('records-count-changed', onRecordsCountChanged)
  load().then(async () => { if (isLoggedIn.value) usedCount.value = (await loadAllRecords()).length })
  windowWidth.value = window.innerWidth
  if (windowWidth.value <= 768) {
    isCollapse.value = true // 移动端默认隐藏侧边栏
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('records-count-changed', onRecordsCountChanged)
})
</script>

<style scoped>
.admin-container {
  height: 100vh;
  overflow: hidden;
}

.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  height: 100vh;
  flex-shrink: 0;
}

/* 移动端 overlay 模式 */
.aside-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 200px !important;
}

/* 移动端遮罩 */
.aside-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.admin-main-area {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  flex: 1;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  color: #303133;
  border-color: #dcdfe6;
  background: #fff;
}

.quota-badge {
  min-width: 58px;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.quota-icon {
  margin-right: 4px;
}

.admin-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 0;
  height: calc(100vh - 50px);
}
</style>
