<template>
  <div class="sidebar-wrap">
    <!-- Logo -->
    <div class="sidebar-logo" :class="{ collapsed: isCollapse }">
      <span v-if="!isCollapse">藏宝阁</span>
      <span v-else>藏</span>
    </div>

    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeIndex"
      :collapse="isCollapse"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <template #title>首页</template>
      </el-menu-item>
      <el-menu-item index="/cookie">
        <el-icon><Key /></el-icon>
        <template #title>Cookie设置</template>
      </el-menu-item>
    </el-menu>
  </div>

  <!-- 回到顶部（放在 body 层级） -->
  <el-backtop :bottom="100" :right="20">
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
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { House, ArrowUpBold, Key } from '@element-plus/icons-vue'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()

const activeIndex = computed(() => route.path)
</script>

<style scoped>
.sidebar-wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  background: #2b3a4a;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-logo.collapsed {
  font-size: 20px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

</style>