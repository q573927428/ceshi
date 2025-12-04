<template>
  <nav class="top-nav">
    <div 
      class="nav-item" 
      :class="{ active: activeIndex === '/' }"
      @click="go('/')"
    >
      <el-icon><House /></el-icon> 首页
    </div>

    <div 
      class="nav-item"
      :class="{ active: activeIndex === '/rent' }"
      @click="go('/rent')"
    >
      <el-icon><Switch /></el-icon> 出租
    </div>

    <div 
      class="nav-item"
      :class="{ active: activeIndex === '/favorite' }"
      @click="go('/favorite')"
    >
      <el-icon><Star /></el-icon> 收藏
    </div>

    <div 
      class="nav-item"
      :class="{ active: activeIndex === '/my' }"
      @click="go('/my')"
    >
      <el-icon><User /></el-icon> 我的
    </div>
  </nav>
  <el-backtop :bottom="100">
    <div
      style="
        height: 100%;
        width: 100%;
        background-color: var(--el-bg-color-overlay);
        box-shadow: var(--el-box-shadow-lighter);
        text-align: center;
        line-height: 40px;
        color: #1989fa;
        border-radius: 50%;
      "
    >
    <el-icon style="margin-top: 10px;"><ArrowUpBold /></el-icon>
    </div>
  </el-backtop>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { House, Star, Switch, User,ArrowUpBold } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 必须是 ref，否则不会更新
const activeIndex = ref(route.path)

// route 变化后更新高亮
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  }
)

const go = (path) => {
  router.push(path)
}
</script>

<style scoped>
.top-nav {
  position: fixed;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 50px;
  background: #e8f3ff;

  display: flex;
  z-index: 99999; /* 保证永远不被遮挡 */

  border-top: 1px solid #e4e4e4;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer; /* 必须给 cursor 指示可点击 */
  user-select: none;

  white-space: nowrap;
  overflow: visible;

  font-size: 15px;
  color: #666;
}

.nav-item.active {
  color: #409EFF;
  font-weight: 600;
  border-top: 2px solid #409EFF;
}
</style>
