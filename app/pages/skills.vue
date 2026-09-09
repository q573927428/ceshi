<template>
  <div class="skills-page">
    <div class="page-heading">
      <h2>率土技能列表</h2>
      <span>完整技能资料与战法信息</span>
    </div>
    <SkillList />
  </div>
</template>
<script setup>import SkillList from '~/components/SkillList.vue'</script>
<style scoped>
.skills-page{min-height:100%}
.page-heading{display:flex;align-items:baseline;gap:12px;padding:18px 20px 0}
.page-heading h2{margin:0;color:#303133;font-size:20px}
.page-heading span{color:#909399;font-size:13px}
</style>
