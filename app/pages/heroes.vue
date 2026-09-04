<template><div class="heroes-page"><div class="page-heading"><h2>率土武将列表</h2><span>完整武将资料与战法信息</span></div><HeroList /></div></template>
<script setup>import HeroList from '~/components/HeroList.vue'</script>
<style scoped>.heroes-page{min-height:100%}.page-heading{display:flex;align-items:baseline;gap:12px;padding:18px 20px 0}.page-heading h2{margin:0;color:#303133;font-size:20px}.page-heading span{color:#909399;font-size:13px}</style>
