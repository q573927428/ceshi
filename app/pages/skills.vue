<template>
  <div class="skills-page">
    <div class="page-heading">
      <h2>率土技能列表</h2>
      <span>完整技能资料与战法信息</span>
    </div>
    <SkillList />
  </div>
</template>
<script setup>
import SkillList from '~/components/SkillList.vue'

useSeoMeta({
  title: '率土技能大全 - 战法效果与技能查询 | 藏宝阁助手',
  keywords: '率土之滨技能,率土战法,技能大全,战法效果,技能查询',
  description: '率土之滨技能与战法资料查询，提供技能品质、类型和战法效果等完整信息，帮助玩家查找和比较率土技能。',
})
</script>
<style scoped>
.skills-page{min-height:100%}
.page-heading{display:flex;align-items:baseline;gap:12px;padding:18px 20px 0}
.page-heading h2{margin:0;color:#303133;font-size:20px}
.page-heading span{color:#909399;font-size:13px}
</style>
