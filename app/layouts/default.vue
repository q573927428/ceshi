<template>
  <el-container class="admin-container">
    <!-- 左侧边栏 -->
    <el-aside
      v-show="!isCollapse || isDesktop"
      :width="isDesktop ? (isCollapse ? '64px' : '200px') : '200px'"
      class="admin-aside"
      :class="{ 'aside-overlay': !isDesktop }"
    >
      <AppHeader :is-collapse="isDesktop && isCollapse" @toggle="toggleSidebar" />
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
      <el-header class="admin-header" height="50px">
        <div class="header-left">
          <el-button text @click="toggleSidebar" style="font-size: 18px;">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <span class="header-title">藏宝阁助手</span>
        </div>
        <div class="header-right">
          <el-tag type="info" effect="plain" size="small">v1.0</el-tag>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="admin-main">
        <NuxtPage />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const isCollapse = ref(false)
const windowWidth = ref(1024)

const isDesktop = computed(() => windowWidth.value > 768)

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
  windowWidth.value = window.innerWidth
  if (windowWidth.value <= 768) {
    isCollapse.value = true // 移动端默认隐藏侧边栏
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
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
}

.admin-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 0;
  height: calc(100vh - 50px);
}
</style>