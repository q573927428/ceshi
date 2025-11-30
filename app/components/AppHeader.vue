<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo fixed-menu"
    mode="horizontal"
    router
  >
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/">对比</el-menu-item>
    <el-menu-item index="/">收藏</el-menu-item>
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

<style scoped>
.fixed-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  display: flex;
  padding: 0;           /* 去掉默认 padding */
  justify-content: space-between; /* 等分 */
}

.el-menu-demo {
  width: 100%;
}

.el-menu-demo .el-menu-item {
  flex: 1;              /* 平均分配 */
  text-align: center;
  min-width: 0;         /* 防止折叠成 ... */
}

</style>
