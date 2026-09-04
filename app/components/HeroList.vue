<template>
  <section class="hero-list">
    <div class="toolbar">
      <el-input v-model="keyword" clearable placeholder="搜索武将名 / 战法" class="search-input"><template #prefix>⌕</template></el-input>
      <div class="filter-row"><span class="filter-label">阵营</span><el-radio-group v-model="countryFilter" size="small"><el-radio-button label="全部" /><el-radio-button v-for="country in countries" :key="country" :label="country" /></el-radio-group></div>
      <div class="filter-row"><span class="filter-label">战法</span><el-radio-group v-model="typeFilter" size="small"><el-radio-button label="全部" /><el-radio-button v-for="type in tacticTypes" :key="type" :label="type" /></el-radio-group></div>
      <div class="filter-row"><span class="filter-label">排序</span><el-radio-group v-model="sortKey" size="small"><el-radio-button label="name">武将名</el-radio-button><el-radio-button label="attGrow">攻击成长</el-radio-button><el-radio-button label="ruseGrow">谋略成长</el-radio-button><el-radio-button label="defGrow">防御成长</el-radio-button><el-radio-button label="speedGrow">速度成长</el-radio-button><el-radio-button label="siegeGrow">攻城成长</el-radio-button></el-radio-group></div>
    </div>
    <div class="list-summary">共 {{ filteredHeroes.length }} 名武将<span v-if="filteredHeroes.length !== heroes.length">（已筛选）</span></div>
    <div v-if="pagedHeroes.length" class="hero-items">
      <article v-for="hero in pagedHeroes" :key="hero.id" class="hero-item">
        <CardItem :name="hero.name" :image-url="hero.imageUrl" :country="hero.countryId" :quality="hero.qualityId" :season="hero.season" :hero-id="hero.id" :advance-num="0" :awake-state="0" />
        <div class="hero-info"><div class="hero-title"><strong :class="`level-${hero.level}`">{{ hero.name }}</strong><el-tag size="small" :type="typeTagType(hero.type)">{{ hero.type }}</el-tag><span v-if="hero.mp !== undefined && hero.mp !== null && hero.mp !== ''" class="probability">概率 {{ hero.mp }}%</span><span class="cost">{{ hero.cost }}C</span></div><p class="tactic"><b>{{ hero.methodName || '暂无战法' }}</b>：{{ hero.methodDesc || '暂无描述' }}</p><div class="stats"><span :class="{ 'stat-highlight': maxGrowth(hero) === Number(hero.attGrow) }" title="初始攻击 / 攻击成长">攻 {{ hero.attack }} <i>+{{ hero.attGrow }}</i></span><span :class="{ 'stat-highlight': maxGrowth(hero) === Number(hero.ruseGrow) }" title="初始谋略 / 谋略成长">谋 {{ hero.ruse }} <i>+{{ hero.ruseGrow }}</i></span><span :class="{ 'stat-highlight': maxGrowth(hero) === Number(hero.defGrow) }" title="初始防御 / 防御成长">防 {{ hero.def }} <i>+{{ hero.defGrow }}</i></span><span :class="{ 'stat-highlight': maxGrowth(hero) === Number(hero.speedGrow) }" title="初始速度 / 速度成长">速 {{ hero.speed }} <i>+{{ hero.speedGrow }}</i></span><span :class="{ 'stat-highlight': maxGrowth(hero) === Number(hero.siegeGrow) }" title="初始攻城值 / 攻城值成长">城 {{ hero.siege }} <i>+{{ hero.siegeGrow }}</i></span></div><div class="meta">攻击距离 {{ hero.distance }}　可用兵种：{{ hero.typeAvailable || '暂无' }}</div></div>
      </article>
    </div><el-empty v-else description="没有符合条件的武将" />
    <div v-if="filteredHeroes.length" class="pagination-wrap"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background layout="prev, pager, next" :page-sizes="[20, 40, 80]" :total="filteredHeroes.length" @size-change="currentPage = 1" /></div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CardItem from '~/components/CardItem.vue'
import heroData from '~/data/heroextra.json'
const countryIds = { 汉: 1, 魏: 2, 蜀: 3, 吴: 4, 群: 5 }
const countries = ['汉', '魏', '蜀', '吴', '群']; const tacticTypes = ['主动', '指挥', '被动', '追击']
const keyword = ref(''); const countryFilter = ref('全部'); const typeFilter = ref('全部'); const sortKey = ref('attGrow'); const currentPage = ref(1); const pageSize = ref(20)
const heroes = computed(() => heroData.map(hero => ({ ...hero, countryId: countryIds[hero.country] || 5, qualityId: Number.parseInt(hero.quality, 10) || 4, season: 'N', imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${hero.iconId || hero.id}.jpg`, typeAvailable: hero.type_availible })))
const filteredHeroes = computed(() => { const query = keyword.value.trim().toLowerCase(); return heroes.value.filter(hero => countryFilter.value === '全部' || hero.country === countryFilter.value).filter(hero => typeFilter.value === '全部' || hero.type === typeFilter.value).filter(hero => !query || [hero.name, hero.methodName, hero.methodDesc, hero.methodDesc1].some(value => String(value || '').toLowerCase().includes(query))).sort((a, b) => sortKey.value === 'name' ? a.name.localeCompare(b.name, 'zh-CN') || a.id - b.id : Number(b[sortKey.value] || 0) - Number(a[sortKey.value] || 0)) })
const pagedHeroes = computed(() => filteredHeroes.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
watch([keyword, countryFilter, typeFilter, sortKey], () => { currentPage.value = 1 })
const maxGrowth = hero => Math.max(...[hero.attGrow, hero.ruseGrow, hero.defGrow, hero.speedGrow, hero.siegeGrow].map(value => Number(value) || 0))
const typeTagType = type => ({ 主动: 'danger', 指挥: 'warning', 被动: 'success', 追击: 'info' }[type] || 'info')
</script>

<style scoped>
.hero-list{width:100%;box-sizing:border-box;padding:16px;margin:0 auto}.toolbar{padding:16px;background:#fff;border-radius:10px;box-shadow:0 1px 5px #dfe3e8}.search-input{max-width:420px;margin-bottom:14px}.filter-row{display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}.filter-label{width:32px;color:#606266;font-size:14px}.list-summary{padding:14px 4px 8px;color:#606266;font-size:14px}.hero-items{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.hero-item{display:flex;gap:14px;padding:10px 12px;background:#fff;border-radius:10px;box-shadow:0 1px 5px #e1e4e8;min-width:0}.hero-info{flex:1;min-width:0}.hero-title{display:flex;align-items:center;gap:7px;color:#303133}.hero-title strong{font-size:15px}.hero-title strong.level-S{color:#8a2c8f}.hero-title strong.level-A{color:#409eff}.hero-title strong.level-B{color:#67c23a}.hero-title strong.level-C,.hero-title strong.level-D{color:#909399}.probability{color:#d46b08;font-size:13px}.cost{color:#a86b18;font-size:13px}.tactic{margin:8px 0;color:#606266;font-size:13px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.tactic b{color:#303133}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.stats span{padding:5px 7px;border-radius:5px;background:#f4f6f8;color:#555;text-align:center;font-size:12px}.stats span.stat-highlight{background:#fffaf0}.stats i{display:block;color:#b36b2c;font-style:normal;margin-top:2px}.meta{margin-top:7px;color:#909399;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pagination-wrap{display:flex;justify-content:center;padding:20px 0}@media(max-width:576px){.hero-list{padding:10px 6px}.hero-items{grid-template-columns:1fr}.hero-item{gap:6px;padding:8px 5px}.stats{grid-template-columns:repeat(2,1fr)}.hero-title{flex-wrap:wrap}.filter-label{width:100%}}
</style>
