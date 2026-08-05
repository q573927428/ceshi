<template>
  <transition name="back-to-top-fade">
    <div
      v-show="show"
      class="back-to-top"
      @click="scrollToTop"
    >
      <el-icon><Top /></el-icon>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Top } from '@element-plus/icons-vue'

const SCROLL_CONTAINER_SELECTOR = '.admin-main'
const SHOW_THRESHOLD = 300

const show = ref(false)
let scrollContainer = null

const onScroll = () => {
  show.value = scrollContainer.scrollTop > SHOW_THRESHOLD
}

const scrollToTop = () => {
  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  scrollContainer = document.querySelector(SCROLL_CONTAINER_SELECTOR)
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', onScroll)
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', onScroll)
  }
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 40px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  transition: background-color 0.3s, transform 0.3s;
}

.back-to-top:hover {
  background: #66b1ff;
  transform: translateY(-2px);
}

.back-to-top .el-icon {
  font-size: 20px;
}

.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: opacity 0.3s;
}

.back-to-top-fade-enter-from,
.back-to-top-fade-leave-to {
  opacity: 0;
}
</style>