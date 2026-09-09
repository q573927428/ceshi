<template>
  <div class="advanced-filter-entry">
    <el-button type="primary" plain @click="openDialog">
      <el-icon><Filter /></el-icon>
      高级筛选<span v-if="selectedCount">（{{ selectedCount }}）</span>
    </el-button>

    <el-dialog v-model="visible" title="高级筛选" :width="dialogWidth" destroy-on-close>
      <el-tabs v-model="activeType" class="filter-type-tabs">
        <el-tab-pane label="热门武将" name="heroes">
          <el-tabs v-model="activeFaction" class="sub-tabs">
            <el-tab-pane
              v-for="faction in popularHeroes"
              :key="faction.name"
              :label="faction.name"
              :name="faction.name"
            >
              <div class="hero-options">
                <div
                  v-for="hero in faction.heroes"
                  :key="hero.name"
                  class="hero-option"
                  :class="{ selected: isHeroSelected(hero.heroId) }"
                  role="checkbox"
                  tabindex="0"
                  :aria-checked="isHeroSelected(hero.heroId)"
                  @click="toggleHero(hero, !isHeroSelected(hero.heroId))"
                  @keydown.enter.prevent="toggleHero(hero, !isHeroSelected(hero.heroId))"
                  @keydown.space.prevent="toggleHero(hero, !isHeroSelected(hero.heroId))"
                >
                  <img class="hero-avatar" :src="avatarUrl(hero.heroId)" :alt="hero.name">
                  <div class="hero-content">
                    <span class="hero-name">{{ hero.name }}</span>
                    <el-input-number
                      class="hero-advance"
                      :aria-label="`${hero.name}最低红度`"
                      :model-value="getHeroAdvance(hero.heroId)"
                      :disabled="!isHeroSelected(hero.heroId)"
                      :min="0"
                      :max="5"
                      :step="1"
                      size="small"
                      controls-position="right"
                      @click.stop
                      @keydown.stop
                      @change="updateHeroAdvance(hero.heroId, $event)"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <el-tab-pane label="热门技能" name="skills">
          <el-tabs v-model="activeSkillType" class="sub-tabs">
            <el-tab-pane
              v-for="group in popularSkills"
              :key="group.name"
              :label="group.name"
              :name="group.name"
            >
              <el-checkbox-group v-model="draftSkills" class="skill-options">
                <el-checkbox-button
                  v-for="skill in group.skills"
                  :key="skill.name"
                  :value="skill.name"
                  :class="`skill-quality-${skill.quality}`"
                >
                  {{ skill.name }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-actions">
          <el-button @click="clearDraft">清空</el-button>
          <span class="draft-count">当前选择 {{ draftHeroes.length + draftSkills.length }} 项</span>
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Filter } from '@element-plus/icons-vue'

interface HeroFilter {
  heroId: number
  name: string
  minAdvance: number
}

interface PopularHero {
  heroId: number
  name: string
}

interface PopularSkill {
  name: string
  quality: 'S' | 'A' | 'B'
}

const props = defineProps<{
  heroes: HeroFilter[]
  skills: string[]
}>()

const emit = defineEmits<{
  'update:heroes': [value: HeroFilter[]]
  'update:skills': [value: string[]]
}>()

const visible = ref(false)
const activeType = ref('heroes')
const activeFaction = ref('绝')
const activeSkillType = ref('指挥')
const draftHeroes = ref<HeroFilter[]>([])
const draftSkills = ref<string[]>([])
const dialogWidth = 'min(920px, 94vw)'
const selectedCount = computed(() => props.heroes.length + props.skills.length)

const popularHeroes = [
  { name: '绝', heroes: [
    { name: '王异', heroId: 100028 }, { name: '吕布', heroId: 100479 },
    { name: '庞统', heroId: 100477 }, { name: '郭嘉', heroId: 100476 },
    { name: '陆逊', heroId: 100478 }, { name: '董卓', heroId: 100480 },
    { name: '曹纯', heroId: 100498 }, { name: '诸葛亮', heroId: 100496 },
  ] },
  { name: '汉', heroes: [
    { name: '吕布', heroId: 100003 }, { name: '蔡文姬', heroId: 100004 },
    { name: '貂蝉', heroId: 100005 }, { name: '何太后', heroId: 100037 },
    { name: '灵帝', heroId: 100101 }, { name: '华佗', heroId: 100369 },
    { name: '董卓', heroId: 100480 }, { name: '张机', heroId: 100526 },
    { name: '朱儁', heroId: 100553 }, { name: '皇甫嵩', heroId: 100630 },
    { name: '荀彧', heroId: 100794 }, { name: '献帝', heroId: 100795 },
    { name: '刘备', heroId: 100803 }, { name: '曹操', heroId: 100804 },
    { name: '孙坚', heroId: 100805 }, { name: '冯嫽', heroId: 100812 },
  ] },
  { name: '魏', heroes: [
    { name: '曹操', heroId: 100023 }, { name: '荀彧', heroId: 100024 },
    { name: '张辽', heroId: 100027 }, { name: '王异', heroId: 100028 },
    { name: '张春华', heroId: 100029 }, { name: '夏侯惇', heroId: 100449 },
    { name: '郝昭', heroId: 100475 }, { name: '郭嘉', heroId: 100476 },
    { name: '曹纯', heroId: 100498 }, { name: '贾诩', heroId: 100618 },
    { name: '徐晃', heroId: 100645 }, { name: '曹植', heroId: 100672 },
    { name: '曹彰', heroId: 100683 }, { name: '乐进', heroId: 100685 },
    { name: '典韦', heroId: 100769 }, { name: '程昱', heroId: 100787 },
    { name: '于禁', heroId: 100796 },
  ] },
  { name: '蜀', heroes: [
    { name: '刘备', heroId: 100016 }, { name: '马云禄', heroId: 100019 },
    { name: '黄月英', heroId: 100020 }, { name: '赵云', heroId: 100021 },
    { name: '张飞', heroId: 100022 }, { name: '关银屏', heroId: 100072 },
    { name: '关羽', heroId: 100451 }, { name: '庞统', heroId: 100477 },
    { name: '诸葛亮', heroId: 100496 }, { name: '法正', heroId: 100582 },
    { name: '马岱', heroId: 100615 }, { name: '严颜', heroId: 100631 },
    { name: '魏延', heroId: 100649 }, { name: '刘禅', heroId: 100689 },
    { name: '马良', heroId: 100792 }, { name: '马谡', heroId: 100799 },
    { name: '蒋琬', heroId: 100800 }, { name: '姜维', heroId: 100806 },
    { name: '黄忠', heroId: 100810 },
  ] },
  { name: '吴', heroes: [
    { name: '孙权', heroId: 100030 }, { name: '周瑜', heroId: 100031 },
    { name: '甘宁', heroId: 100034 }, { name: '吕蒙', heroId: 100035 },
    { name: '太史慈', heroId: 100090 }, { name: '陆逊', heroId: 100478 },
    { name: '陆抗', heroId: 100574 }, { name: '周泰', heroId: 100589 },
    { name: '大乔', heroId: 100619 }, { name: '张昭', heroId: 100648 },
    { name: '小乔', heroId: 100687 }, { name: '鲁肃', heroId: 100741 },
    { name: '黄盖', heroId: 100783 }, { name: '周瑜', heroId: 100784 },
    { name: '丁奉', heroId: 100788 }, { name: '陆逊', heroId: 100791 },
    { name: '孙权', heroId: 100808 },
  ] },
  { name: '群', heroes: [
    { name: '张角', heroId: 100008 }, { name: '马超', heroId: 100013 },
    { name: '甄洛', heroId: 100015 }, { name: '貂蝉', heroId: 100337 },
    { name: '陈宫', heroId: 100443 }, { name: '张宁', heroId: 100474 },
    { name: '木鹿大王', heroId: 100452 }, { name: '吕布', heroId: 100479 },
    { name: '祝融夫人', heroId: 100494 }, { name: '兀突骨', heroId: 100519 },
    { name: '李儒', heroId: 100604 }, { name: '张绣', heroId: 100620 },
    { name: '华雄', heroId: 100647 }, { name: '高顺', heroId: 100656 },
    { name: '袁绍', heroId: 100670 }, { name: '公孙瓒', heroId: 100677 },
    { name: '田丰', heroId: 100692 }, { name: '沮授', heroId: 100771 },
    { name: '马腾', heroId: 100785 }, { name: '袁术', heroId: 100790 },
    { name: '左慈', heroId: 100802 }, { name: '司马徽', heroId: 100811 },
  ] },
  { name: '晋', heroes: [
    { name: '司马师', heroId: 100701 }, { name: '司马昭', heroId: 100702 },
    { name: '司马炎', heroId: 100703 }, { name: '文鸯', heroId: 100704 },
    { name: '杜预', heroId: 100705 }, { name: '王元姬', heroId: 100706 },
    { name: '卫瓘', heroId: 100707 }, { name: '贾充', heroId: 100708 },
    { name: '羊祜', heroId: 100709 }, { name: '胡芳', heroId: 100797 },
    { name: '裴秀', heroId: 100801 }, { name: '司马懿', heroId: 100807 },
    { name: '刘徽', heroId: 100814 },
  ] },
]

const popularSkills: Array<{ name: string, skills: PopularSkill[] }> = [
  { name: '指挥', skills: [
    { name: '正始之变', quality: 'S' }, { name: '攻其不备', quality: 'S' },
    { name: '桃园结义', quality: 'S' }, { name: '无心恋战', quality: 'S' },
    { name: '除恶务尽', quality: 'S' }, { name: '避锐治气', quality: 'S' },
    { name: '定军山', quality: 'S' }, { name: '七擒七纵', quality: 'S' },
    { name: '单骑救主', quality: 'A' }, { name: '久战熟谋', quality: 'A' },
    { name: '合纵连横', quality: 'A' }, { name: '诱敌深入', quality: 'A' },
    { name: '胜兵求战', quality: 'B' },
  ] },
  { name: '主动', skills: [
    { name: '河内世泽', quality: 'S' }, { name: '三术奇谋', quality: 'S' },
    { name: '一骑当千', quality: 'S' }, { name: '利兵谋胜', quality: 'S' },
    { name: '三军之众', quality: 'S' }, { name: '妖术', quality: 'S' },
    { name: '浑水摸鱼', quality: 'S' }, { name: '火烧连营', quality: 'S' },
    { name: '及锋而试', quality: 'S' }, { name: '汜水关', quality: 'A' },
    { name: '鼎足江东', quality: 'A' }, { name: '凤仪亭', quality: 'A' },
    { name: '袭屯夺气', quality: 'A' }, { name: '敛众定气', quality: 'A' },
  ] },
  { name: '追击', skills: [
    { name: '乘胜追击', quality: 'S' },
  ] },
  { name: '被动', skills: [
    { name: '百战无怯', quality: 'S' }, { name: '击势', quality: 'S' },
    { name: '垒实迎击', quality: 'S' }, { name: '枭雄', quality: 'A' },
    { name: '令无空悬', quality: 'A' }, { name: '以诱待来', quality: 'A' },
    { name: '胜敌益强', quality: 'A' }, { name: '先声夺人', quality: 'A' },
  ] },
]

const avatarUrl = (heroId: number) =>
  `https://g0.gph.netease.com/ngsocial/community/stzb/cn/cards/cut/card_small_${heroId}.jpg`

const openDialog = () => {
  draftHeroes.value = props.heroes.map((hero) => ({ ...hero }))
  draftSkills.value = [...props.skills]
  visible.value = true
}

const isHeroSelected = (heroId: number) => draftHeroes.value.some((hero) => hero.heroId === heroId)
const getHeroAdvance = (heroId: number) => draftHeroes.value.find((hero) => hero.heroId === heroId)?.minAdvance ?? 0

const toggleHero = (hero: PopularHero, selected: boolean) => {
  if (selected) {
    if (!isHeroSelected(hero.heroId)) {
      draftHeroes.value.push({ heroId: hero.heroId, name: hero.name, minAdvance: 0 })
    }
  } else {
    draftHeroes.value = draftHeroes.value.filter((item) => item.heroId !== hero.heroId)
  }
}

const updateHeroAdvance = (heroId: number, value: number | undefined) => {
  const minAdvance = Math.min(5, Math.max(0, Math.trunc(Number(value) || 0)))
  draftHeroes.value = draftHeroes.value.map((hero) => hero.heroId === heroId ? { ...hero, minAdvance } : hero)
}

const clearDraft = () => {
  draftHeroes.value = []
  draftSkills.value = []
}

const applyFilters = () => {
  emit('update:heroes', draftHeroes.value.map((hero) => ({ ...hero })))
  emit('update:skills', [...draftSkills.value])
  visible.value = false
}
</script>

<style scoped>
.advanced-filter-entry { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.draft-count { color: #606266; font-size: 12px; }
.filter-type-tabs :deep(.el-tabs__header) { margin-bottom: 12px; }
.sub-tabs :deep(.el-tabs__header) { margin-bottom: 10px; }
.hero-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 6px;
  max-height: min(56vh, 560px);
  padding: 1px 5px 1px 1px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.hero-option {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 64px;
  min-width: 0;
  padding: 5px 6px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease, transform .15s ease;
}
.hero-option:hover { border-color: #409eff; background: #f2f8ff; box-shadow: 0 3px 8px #409eff33; transform: translateY(-1px); }
.hero-option:focus-visible { outline: 2px solid #409eff; outline-offset: 1px; }
.hero-option.selected { border-color: #409eff; background: #ecf5ff; }
.hero-option.selected:hover { border-color: #337ecc; background: #d9ecff; box-shadow: 0 3px 9px #337ecc4d; }
.hero-avatar { width: 42px; height: 42px; flex: 0 0 42px; border-radius: 4px; object-fit: cover; background: #ebeef5; }
.hero-content { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; }
.hero-name { width: 100%; overflow: hidden; color: #303133; font-size: 12px; line-height: 18px; text-overflow: ellipsis; white-space: nowrap; }
.hero-advance { width: 58px; }
.skill-options { display: flex; flex-wrap: wrap; gap: 8px; max-height: min(56vh, 560px); overflow-y: auto; }
.skill-options :deep(.el-checkbox-button__inner) { border: 1px solid #dcdfe6; border-radius: 4px; box-shadow: none; }
.skill-options .skill-quality-S :deep(.el-checkbox-button__inner) { color: #8a2c8f; border-color: #c8a2ca; background: #fbf5fc; }
.skill-options .skill-quality-A :deep(.el-checkbox-button__inner) { color: #337ecc; border-color: #a0cfff; background: #f2f8ff; }
.skill-options .skill-quality-B :deep(.el-checkbox-button__inner) { color: #529b2e; border-color: #b3e19d; background: #f5fbf2; }
.skill-options :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) { color: #fff; }
.skill-options .skill-quality-S.is-checked :deep(.el-checkbox-button__inner) { border-color: #8a2c8f; background: #8a2c8f; }
.skill-options .skill-quality-A.is-checked :deep(.el-checkbox-button__inner) { border-color: #337ecc; background: #337ecc; }
.skill-options .skill-quality-B.is-checked :deep(.el-checkbox-button__inner) { border-color: #529b2e; background: #529b2e; }
.dialog-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.dialog-actions .draft-count { margin-right: auto; }
@media (max-width: 767px) {
  .hero-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: max(280px, calc(100dvh - 390px));
  }
  .skill-options { max-height: max(280px, calc(100dvh - 390px)); }
  .sub-tabs :deep(.el-tabs__nav-wrap) { overflow-x: auto; }
  .sub-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
  .dialog-actions { flex-wrap: wrap; }
  .dialog-actions .draft-count { width: 100%; order: -1; }
}
</style>
