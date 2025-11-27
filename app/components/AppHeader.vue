<template>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router>
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/cards">卡牌</el-menu-item>
    <el-menu-item index="/duibi">对比</el-menu-item>
    <el-menu-item index="/vslist">链接对比</el-menu-item>
    <el-menu-item index="/collected">我的收藏</el-menu-item>
  </el-menu>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '/'
    }
  },
  watch: {
    '$route'(to) {
      this.activeIndex = to.path
    }
  },
  mounted() {
    this.activeIndex = this.$route.path
  }
}
</script>