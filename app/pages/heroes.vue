<template><div class="heroes-page"><div class="page-heading"><h2>率土武将列表</h2><span>完整武将资料与战法信息</span></div><HeroList /></div></template>
<script setup>
import HeroList from '~/components/HeroList.vue'

useSeoMeta({
  title: '率土武将大全 - 武将属性与战法查询 | 率土助手',
  keywords: '率土之滨武将,率土武将大全,武将属性,武将战法,武将查询',
  description: '率土之滨武将资料查询，汇总武将属性、阵营、兵种与自带战法信息，方便玩家快速筛选和了解率土武将。',
})
</script>
<style scoped>.heroes-page{min-height:100%}.page-heading{display:flex;align-items:baseline;gap:12px;padding:18px 20px 0}.page-heading h2{margin:0;color:#303133;font-size:20px}.page-heading span{color:#909399;font-size:13px}</style>
