<template>
  <section class="skill-page">
    <div class="search-row"><el-input v-model="query" clearable placeholder="搜索技能名 / 效果 / 标签" :prefix-icon="Search" /></div>
    <div class="filters">
      <div class="filter-line"><span class="label">标签</span><el-button v-for="tag in tagOptions" :key="tag" size="small" round :type="selectedTags.includes(tag) ? 'primary' : ''" @click="toggleTag(tag)">{{ tag }}</el-button></div>
      <div class="filter-line"><span class="label">类型</span><el-button v-for="type in typeOptions" :key="type" size="small" round :type="selectedType === type ? 'primary' : ''" @click="selectedType = type">{{ type }}</el-button></div>
      <div class="filter-line"><span class="label">等级</span><el-button v-for="quality in qualityOptions" :key="quality" size="small" round :type="selectedQuality === quality ? 'primary' : ''" :class="[`quality-filter-${quality}`, { selected: selectedQuality === quality }]" @click="selectedQuality = quality">{{ quality }}</el-button></div>
      <div class="filter-line"><span class="label">距离</span><el-button v-for="distance in distanceOptions" :key="distance" size="small" round :type="selectedDistance === distance ? 'primary' : ''" @click="selectedDistance = distance">{{ distance }}</el-button></div>
    </div>
    <div class="result-meta">共 {{ filteredSkills.length }} 个技能</div>
    <div class="skill-grid">
      <article v-for="skill in filteredSkills" :key="skill.id" class="skill-card">
        <header :class="[`type-${skill.type}`, `quality-${skill.zfQuality || 'D'}`]"><span class="skill-type">{{ skill.type }}</span><h3>{{ skill.name }}</h3><span class="quality">{{ skill.zfQuality || '-' }}</span></header>
        <div class="meta">距离：{{ skill.distance }}　兵种：{{ skill.soldierType || '不限' }}　发动率：{{ skill.probability || '--' }}</div>
        <div class="tags"><el-tag v-for="tag in tagsById[String(skill.id)] || []" :key="tag" size="small" effect="plain">{{ tag }}</el-tag></div>
        <p class="target">目标：{{ skill.targetShow || '—' }}</p><p class="desc">{{ skill.desc || '暂无描述' }}</p>
        <div v-if="heroesBySkill[skill.id]?.length" class="matched-heroes">
          <span class="matched-label">对应武将</span>
          <div class="matched-hero-list"><div v-for="hero in heroesBySkill[skill.id]" :key="hero.id" class="matched-hero"><CardItem :name="hero.name" :image-url="hero.imageUrl" :country="hero.countryId" :quality="parseQuality(hero.quality)" :season="'N'" :advance-num="0" :awake-state="0" /></div></div>
        </div>
        <details v-if="skill.studyDesc && skill.studyDesc !== '无'"><summary>研究材料</summary><p>{{ skill.studyDesc }}</p><p v-if="skill.studyDesc2 && skill.studyDesc2 !== '无'">{{ skill.studyDesc2 }}</p></details>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import skills from '~/data/skills.json'
import tagData from '~/data/skillTags.json'
import heroData from '~/data/heroextra.json'
import CardItem from '~/components/CardItem.vue'
const query = ref(''), selectedTags = ref([]), selectedType = ref('全部'), selectedQuality = ref('全部'), selectedDistance = ref('全部')
const tagsById = tagData.tagsById || {}
const countryIds = { 汉: 1, 魏: 2, 蜀: 3, 吴: 4, 群: 5 }
const heroesBySkill = Object.groupBy ? Object.groupBy(heroData.filter(hero => hero.methodId), hero => hero.methodId) : heroData.filter(hero => hero.methodId).reduce((map, hero) => { (map[hero.methodId] ||= []).push(hero); return map }, {})
Object.values(heroesBySkill).forEach(list => list.forEach(hero => { hero.countryId = countryIds[hero.country] || 5; hero.imageUrl = `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${hero.iconId || hero.id}.jpg` }))
const parseQuality = quality => Number.parseInt(String(quality || '').split('-')[0], 10) || 4
const tagOptions = tagData.options || []
const typeOptions = ['全部', '主动', '指挥', '被动', '追击']
const qualityOptions = ['全部', 'S', 'A', 'B', 'C', 'D']
const distanceOptions = ['全部', '1', '2', '3', '4', '5', '无']
const toggleTag = tag => selectedTags.value = selectedTags.value.includes(tag) ? selectedTags.value.filter(x => x !== tag) : [...selectedTags.value, tag]
const filteredSkills = computed(() => {
  const q = query.value.trim().toLowerCase()
  return skills.filter(skill => {
    const tags = tagsById[String(skill.id)] || []
    const textMatch = !q || [skill.name, skill.desc, skill.effect, skill.targetShow, skill.soldierType, ...tags].join(' ').toLowerCase().includes(q)
    return textMatch && (selectedType.value === '全部' || skill.type === selectedType.value) && (selectedQuality.value === '全部' || (skill.zfQuality || 'D') === selectedQuality.value) && (selectedDistance.value === '全部' || String(skill.distance) === selectedDistance.value || (selectedDistance.value === '无' && String(skill.distance) === '--')) && (!selectedTags.value.length || selectedTags.value.every(tag => tags.includes(tag)))
  })
})
</script>
<style scoped>
.skill-page{padding:16px;width:100%;box-sizing:border-box}.search-row{margin-bottom:10px}.filters{background:#fff;border:1px solid #ebeef5;border-radius:8px;padding:10px 12px}.filter-line{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:7px 0}.filter-line :deep(.el-button){margin-left:2px}.label{width:42px;color:#606266;font-weight:600}.result-meta{padding:12px 2px;color:#909399;font-size:13px}.skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}.skill-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:13px;box-shadow:0 1px 3px #0000000d}.skill-card header{display:flex;align-items:center;gap:8px;border-left:4px solid #909399;padding-left:8px}.skill-card header.type-主动{border-color:#e67e22}.skill-card header.type-指挥{border-color:#27ae60}.skill-card header.type-被动{border-color:#2980b9}.skill-card header.type-追击{border-color:#8a2c8f}.skill-card h3{margin:0;flex:1;font-size:16px;color:#303133}.skill-card header.quality-S h3,.skill-card header.quality-S .quality{color:#8a2c8f}.skill-card header.quality-A h3,.skill-card header.quality-A .quality{color:#409eff}.skill-card header.quality-B h3,.skill-card header.quality-B .quality{color:#67c23a}.skill-card header.quality-C h3,.skill-card header.quality-C .quality{color:#909399}.skill-card header.quality-D h3,.skill-card header.quality-D .quality{color:#000}.skill-type{color:#fff;border-radius:4px;padding:3px 7px;font-size:12px;background:#7f8c8d}.type-主动 .skill-type{background:#e67e22}.type-指挥 .skill-type{background:#27ae60}.type-被动 .skill-type{background:#2980b9}.type-追击 .skill-type{background:#8a2c8f}.quality{font-weight:700;font-size:18px}.meta,.target{font-size:12px;color:#606266;margin:9px 0}.tags{display:flex;gap:5px;flex-wrap:wrap}.desc{font-size:13px;line-height:1.65;color:#303133;margin:8px 0}.skill-card details{font-size:12px;color:#606266}.skill-card summary{cursor:pointer;color:#409eff}.matched-heroes{border-top:1px solid #f0f0f0;margin-top:10px;padding-top:8px}.matched-label{font-size:12px;color:#909399}.matched-hero-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}.matched-hero{display:flex;flex-direction:column;align-items:center;font-size:11px;color:#606266}.matched-hero :deep(.wujiang-item){margin:0;width:52px;transform:scale(.8);transform-origin:top center;height:72px}.quality-filter-S{color:#8a2c8f}.quality-filter-A{color:#409eff}.quality-filter-B{color:#67c23a}.quality-filter-C{color:#909399}.quality-filter-D{color:#000}.quality-filter-全部.selected,.quality-filter-S.selected,.quality-filter-A.selected,.quality-filter-B.selected,.quality-filter-C.selected,.quality-filter-D.selected{font-weight:700;border-width:2px}@media(max-width:600px){.skill-grid{grid-template-columns:1fr}.skill-page{padding:10px}}
</style>








