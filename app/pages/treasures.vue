<template><div class="treasures-page"><div class="page-heading"><h2>率土宝物</h2><span>完整宝物资料与特性效果</span></div><TreasureList /></div></template>
<script setup>
import TreasureList from '~/components/TreasureList.vue'

useSeoMeta({
  title: '率土宝物大全 - 宝物特性与效果查询 | 率土助手',
  keywords: '率土之滨宝物,率土宝物大全,宝物特性,宝物效果,宝物查询',
  description: '率土之滨宝物资料查询，收录宝物类型、品质、特性与效果信息，方便玩家筛选和比较率土宝物。',
})
</script>
<style scoped>.treasures-page{min-height:100%}.page-heading{display:flex;align-items:baseline;gap:12px;padding:18px 20px 0}.page-heading h2{margin:0;color:#303133;font-size:20px}.page-heading span{color:#909399;font-size:13px}</style>
