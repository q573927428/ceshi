<template>
  <section class="treasure-list">
    <div class="toolbar"><el-input v-model="query" clearable placeholder="搜索宝物名称、特性或效果" :prefix-icon="Search" /><span class="count">共 {{ filteredTreasures.length }} / {{ treasures.length }} 件</span></div>
    <el-empty v-if="!filteredTreasures.length" description="没有匹配的宝物" />
    <div v-else class="treasure-stack">
      <article v-for="treasure in filteredTreasures" :key="treasure.value" class="treasure-card">
        <header class="treasure-header"><img class="treasure-icon" :src="imageUrl(treasure)" :alt="treasure.label" loading="lazy" @error="onImageError" /><div class="treasure-title"><small>宝物属性</small><strong>{{ treasure.label }}</strong><em v-if="treasure.pinyin">{{ treasure.pinyin }}</em></div><b class="feature-count">{{ treasure.featureNames?.length || 0 }} 项</b></header>
        <div v-if="treasure.baseFeature" class="base-features"><span v-for="(effect, name) in treasure.baseFeature" :key="name" class="base-feature">{{ name }}：{{ effect }}</span></div>
        <div class="feature-tabs" role="tablist"><button v-for="(feature, index) in treasure.featureNames || []" :key="feature.name" :class="{ active: activeFeature(treasure) === index }" @click="setFeature(treasure, index)">{{ feature.name }}</button></div>
        <div v-if="currentFeature(treasure)" class="levels"><div v-for="row in visibleLevels(currentFeature(treasure))" :key="currentFeature(treasure).ids?.[row.index] || row.index" class="level-row" :class="{ rare: row.item[3] === 1, powder: !isJade(row.item[2]) && row.item[3] !== 1, featured: row.index >= 8 }"><div class="level-name">{{ currentFeature(treasure).values?.[row.index] ?? row.index + 1 }} <i v-if="row.item[3] === 1" class="red-label">红</i><i v-else class="pink-label">粉</i></div><div class="effect">{{ row.item[1] || row.item[0] }}</div><div class="price">{{ formatPrice(row.item[2]) }}</div></div></div>
      </article>
    </div>
  </section>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import treasures from '~/data/treasures.json'
const query = ref(''); const selected = reactive({})
const filteredTreasures = computed(() => { const keyword = query.value.trim().toLowerCase(); return keyword ? treasures.filter((treasure) => JSON.stringify(treasure).toLowerCase().includes(keyword)) : treasures })
const activeFeature = (treasure) => selected[treasure.value] ?? 0
const setFeature = (treasure, index) => { selected[treasure.value] = index }
const currentFeature = (treasure) => treasure.featureNames?.[activeFeature(treasure)]
const isJade = (value) => /^s/i.test(String(value ?? '').trim())
const visibleLevels = (feature) => (feature?.list || []).map((item, index) => ({ item, index })).filter(({ item }) => !isJade(item[2]) || item[3] === 1)
const imageUrl = (treasure) => `https://cbg-stzb.res.netease.com/game_res/gears/cut/gear_${treasure.value}.jpg`
const onImageError = (event) => { event.target.style.visibility = 'hidden' }
const formatPrice = (value) => { if (value == null || value === '') return ''; const raw = String(value).trim(); const isJade = /^s/i.test(raw); const number = Number(raw.replace(/^s/i, '')); if (!Number.isFinite(number)) return ''; return isJade ? `${number.toLocaleString('zh-CN')} 玉符` : `¥${number.toLocaleString('zh-CN')}` }
</script>
<style scoped>
.treasure-list{padding:16px 20px 30px}.toolbar{display:flex;align-items:center;gap:14px;margin-bottom:14px}.toolbar .el-input{max-width:420px}.count{color:#909399;font-size:13px;white-space:nowrap}.treasure-stack{display:flex;flex-direction:column;gap:14px;max-width:920px;margin:auto}.treasure-card{overflow:hidden;background:#fff;border:1px solid #dcdfe6;border-radius:8px;box-shadow:0 1px 3px #0000000d}.treasure-header{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #ebeef5}.treasure-mark{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(145deg,#594b38,#191715);color:#e7d2ad;font-size:18px;font-weight:700}.treasure-title{display:flex;flex-direction:column;line-height:1.15}.treasure-title small{color:#909399;font-size:11px}.treasure-title strong{font-size:18px;color:#303133}.treasure-title em{color:#a8abb2;font-size:11px;font-style:normal}.feature-count{margin-left:auto;color:#1769aa;font-size:13px}.base-features{padding:8px 12px 2px;display:flex;flex-wrap:wrap;gap:5px}.base-feature{font-size:12px;color:#606266;background:#f5f7fa;border-radius:3px;padding:4px 7px}.feature-tabs{display:flex;gap:7px;padding:8px 10px;border-bottom:1px solid #ebeef5;overflow-x:auto}.feature-tabs button{flex:0 0 auto;border:1px solid #dcdfe6;background:#fff;border-radius:18px;padding:5px 13px;color:#606266;cursor:pointer}.feature-tabs button.active{border-color:#409eff;background:#ecf5ff;color:#1769aa}.levels{display:flex;flex-direction:column}.level-row{display:grid;grid-template-columns:58px 1fr 86px;align-items:center;min-height:42px;padding:5px 12px;border-bottom:1px solid #f0f2f5;font-size:12px;color:#606266}.level-row:last-child{border-bottom:0}.level-row.featured{background:#fff5fa}.level-row.rare{color:#d93055}.level-name{font-size:15px;font-weight:600;color:#303133}.rare .level-name{color:#d93055}.level-name i{font-style:normal;font-size:10px;color:#fff;background:#d93055;border-radius:3px;padding:1px 3px;margin-left:3px}.effect{line-height:1.35}.price{text-align:right;color:#d93055;font-weight:600;font-size:13px}@media(max-width:576px){.treasure-list{padding:12px 8px}.toolbar{align-items:stretch;flex-direction:column;gap:6px}.toolbar .el-input{max-width:none}.level-row{grid-template-columns:48px 1fr 68px;padding:5px 8px}.treasure-title strong{font-size:16px}}
.treasure-list{width:100%;box-sizing:border-box}.treasure-icon{width:42px;height:42px;border-radius:8px;object-fit:cover;background:linear-gradient(145deg,#594b38,#191715)}.treasure-stack{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;width:100%;max-width:none;margin:0}.treasure-card{min-width:0}.level-row.rare{background:#fff!important;color:#b91c3a;border-left:3px solid #b91c3a}.level-row.powder{background:#fff!important;color:#7b3152;border-left:3px solid #f09ac0}.pink-label,.red-label{font-style:normal;font-size:10px;color:#fff;border-radius:3px;padding:1px 3px;margin-left:3px}.pink-label{background:#f09ac0}.red-label{background:#b91c3a}@media(max-width:576px){.treasure-stack{grid-template-columns:1fr}}
</style>
