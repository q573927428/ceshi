<template> 
  <div class="skill-card-container">
    <el-dialog v-model="skillDialogOpen" title="添加战法" width="80%">
      <el-input v-model.trim="skillSearch" placeholder="输入战法名称" clearable @keyup.enter="searchSkills">
        <template #append><el-button @click="searchSkills">搜索</el-button></template>
      </el-input>
      <el-select v-model="skillTargetCategory" style="width: 100%; margin-top: 12px;"><el-option v-for="category in categories" :key="category.name" :label="category.name" :value="category.name" /></el-select>
        <div v-if="skillSearchSubmitted" class="search-results">
          <div v-for="group in groupedSkillResults" :key="group.name" class="result-group">
            <div class="result-group-title">{{ group.name }} ({{ group.skills.length }})</div>
            <div class="result-group-items">
              <div v-for="skill in group.skills" :key="skill.skill_id" class="result-item" @click="addSelectedSkill(skill)">
                <SkillItem v-bind="skill" />
                <div class="result-id">ID: {{ skill.skill_id }}</div>
              </div>
            </div>
          </div>
          <span v-if="!skillSearchResults.length">未找到匹配战法</span>
        </div>
    </el-dialog>
    <div v-for="category in categories" :key="category.name" class="category-section">
      <div class="category-title-row">
        <h2 class="category-title">{{ category.name }} ({{ category.skills.length }})</h2>
        <el-button type="primary" size="small" plain circle title="添加战法" @click="openSkillDialog(category.name)">+</el-button>
      </div>
      <div class="skills-container">
        <div v-for="skill in category.skills" :key="skill.skill_id" class="managed-item">
          <SkillItem v-bind="skill" />
          <button type="button" class="remove-item" title="删除" @click="removeSkill(category, skill)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SkillItem from './SkillItem.vue'

export default {
  name: 'SkillCard',
  components: {
    SkillItem
  },
  props: {
    skillData: {
      type: Array,
      default: () => []
    },
    // 可按分组追加技能：{ '主动技能': [{ skill_id, name, ... }] }
    // 也支持 [{ category: '主动技能', skill: { ... } }] 形式。
    customSkills: {
      type: [Object, Array],
      default: () => ({})
    },
    skillQualityMap: {
      type: Object,
      default: () => ({})
    },
    uniqueCards: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const categories = [
        {
          name: '指挥技能',
          skills: this.generateCommandSkills()
        },
        {
          name: '主动技能',
          skills: this.generateActiveSkills()
        },
        {
          name: '追击技能',
          skills: this.generateChaseSkills()
        },
        {
          name: '被动技能',
          skills: this.generatePassiveSkills()
        }
      ]
    this.appendCustomSkills(categories, this.loadStoredSkills())
    this.appendCustomSkills(categories, this.customSkills)
    this.sortSkillsByQuality(categories)
    return {
      categories,
      skillSearch: '',
      selectedSkillId: null,
      skillTargetCategory: categories[0].name
      ,skillDialogOpen: false, skillSearchSubmitted: false
    }
  },
  computed: {
    skillSearchResults() {
      const query = String(this.skillSearch || '').trim().toLowerCase()
      const unique = new Map()
      const accountSource = Array.isArray(this.skillData)
        ? this.skillData
        : (this.skillData?.skills || this.skillData?.data || [])
      const source = accountSource
      source.forEach(rawSkill => {
        const skillId = rawSkill.skill_id ?? rawSkill.id
        const skill = {
          ...rawSkill,
          skill_id: skillId,
          name: rawSkill.name || rawSkill.skill_name,
          quality: rawSkill.quality || this.skillQualityMap[skillId] || 'D'
        }
        if (skill.skill_id != null && !unique.has(skill.skill_id)) unique.set(skill.skill_id, skill)
      })
      return [...unique.values()].filter(skill => String(skill.name || '').toLowerCase().includes(query))
    },
    selectedSkill() {
      return this.skillSearchResults.find(skill => skill.skill_id === this.selectedSkillId)
    },
    groupedSkillResults() {
      const groups = new Map()
      this.skillSearchResults.forEach(skill => {
        const infoType = String(skill.skill_info?.[2] || '').trim()
        const typeName = infoType.includes('指挥')
          ? '指挥'
          : infoType.includes('主动')
            ? '主动'
            : infoType.includes('追击')
              ? '追击'
              : infoType.includes('被动')
                ? '被动'
                : ({ 3: '主动', 2: '指挥', 1: '被动', 4: '追击' }[Number(skill.skill_type)] || '其他')
        if (!groups.has(typeName)) groups.set(typeName, [])
        groups.get(typeName).push(skill)
      })
      const order = ['指挥', '主动', '追击', '被动']
      return [...groups]
        .sort(([nameA], [nameB]) => {
          const indexA = order.indexOf(nameA)
          const indexB = order.indexOf(nameB)
          return (indexA < 0 ? order.length : indexA) - (indexB < 0 ? order.length : indexB)
        })
        .map(([name, skills]) => ({
          name,
          skills: skills.sort((skillA, skillB) => {
            const qualityOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 }
            return (qualityOrder[skillA.quality] ?? 4) - (qualityOrder[skillB.quality] ?? 4)
          })
        }))
    }
  },
  watch: {
    skillSearch() {
      this.selectedSkillId = this.skillSearchResults[0]?.skill_id || null
      // 输入内容变化时直接刷新结果，无需额外点击“搜索”。
      // 保留该状态字段是为了兼容回车和按钮搜索的交互。
      this.skillSearchSubmitted = true
    },
    skillData: {
      handler(newVal) {
        this.updateSkillOpacity(newVal);
      },
      immediate: true
    },
    uniqueCards: {
      handler() {
        this.updateDismantleStatus()
      },
      immediate: true
    }
  },
  methods: {
    openSkillDialog(categoryName) {
      this.skillTargetCategory = categoryName
      this.skillSearchSubmitted = true
      this.skillDialogOpen = true
    },
    sortSkillsByQuality(categories) {
      const qualityOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 }
      categories.forEach(category => {
        category.skills.sort((skillA, skillB) =>
          (qualityOrder[skillA.quality] ?? 4) - (qualityOrder[skillB.quality] ?? 4)
        )
      })
    },
    loadStoredSkills() { try { return JSON.parse(localStorage.getItem('stzb-custom-skills') || '{}') } catch { return {} } },
    persistCustomSkills() {
      const result = {}
      this.categories.forEach(category => { const items = category.skills.filter(skill => skill._customAdded); if (items.length) result[category.name] = items })
      localStorage.setItem('stzb-custom-skills', JSON.stringify(result))
  },
    searchSkills() { this.skillSearchSubmitted = true },
    addSelectedSkill(skill = this.selectedSkill) {
      if (!skill) return
      const target = this.categories.find(category => category.name === this.skillTargetCategory)
      if (!target || target.skills.some(item => item.skill_id === skill.skill_id)) return
      target.skills.push({ ...skill, opacity: 1, _customAdded: true })
      this.sortSkillsByQuality(this.categories)
      this.persistCustomSkills()
      this.skillDialogOpen = false
    },
    removeSkill(category, skill) {
      category.skills = category.skills.filter(item => item.skill_id !== skill.skill_id)
      this.persistCustomSkills()
    },
    appendCustomSkills(categories, customSkills) {
      const entries = Array.isArray(customSkills)
        ? customSkills
        : Object.entries(customSkills || {}).flatMap(([category, skills]) =>
            (Array.isArray(skills) ? skills : [skills]).map(skill => ({ category, skill }))
          )

      entries.forEach(entry => {
        const categoryName = entry.category || entry.group || entry.categoryName
        const skill = entry.skill || entry.item || entry
        const target = categories.find(category => category.name === categoryName)
        if (!target || !skill || skill.skill_id == null) return
        if (target.skills.some(item => item.skill_id === skill.skill_id)) return
        target.skills.push({ opacity: 0.3, research_progress: 100, ...skill, _customAdded: true })
      })
    },

    generateCommandSkills() {
      // 指挥技能示例
      const commandSkills = [
        { skill_id: 200244, name: "正始之变", season: 2, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100701] },
        { skill_id: 200755, name: "攻其不备", season: 3, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100498,100495] },
        { skill_id: 200784, name: "桃园结义", season: 2, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100016] },
        { skill_id: 200201, name: "无心恋战", season: 0, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100026,100337] },
        { skill_id: 200862, name: "单骑救主", season: 2, skill_type: 2, research_progress: 100, quality: "A", hero_id: [102001] },
        { skill_id: 200754, name: "胜兵求战", season: 3, skill_type: 2, research_progress: 100, quality: "B", hero_id: [100497,100496] },
        { skill_id: 200959, name: "久战熟谋", season: 4, skill_type: 2, research_progress: 100, quality: "A", hero_id: [100683,100684] },
        { skill_id: 200964, name: "合纵连横", season: 0, skill_type: 2, research_progress: 100, quality: "A", hero_id: [100689,100690] },
        { skill_id: 201008, name: "诱敌深入", season: 0, skill_type: 2, research_progress: 100, quality: "A", hero_id: [100771,100741] },
        { skill_id: 200276, name: "除恶务尽", season: 4, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100799,100800] },
        { skill_id: 200291, name: "避锐治气", season: 4, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100806,100807,100808] },
        { skill_id: 200293, name: "定军山", season: 4, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100810] },
        { skill_id: 200298, name: "七擒七纵", season: 4, skill_type: 2, research_progress: 100, quality: "S", hero_id: [100815] }
      ];

      return commandSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generateActiveSkills() {
      // 主动技能示例
      const activeSkills = [
        { skill_id: 200847, name: "河内世泽", season: 4, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100472] },
        { skill_id: 200938, name: "三术奇谋", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100654,100672] },
        { skill_id: 200647, name: "一骑当千", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100022,100003] },
        { skill_id: 200814, name: "汜水关", season: 2, skill_type: 3, research_progress: 100, quality: "A", hero_id: [100026] },
        { skill_id: 200844, name: "鼎足江东", season: 2, skill_type: 3, research_progress: 100, quality: "A", hero_id: [100030] },
        { skill_id: 200789, name: "凤仪亭", season: 2, skill_type: 3, research_progress: 100, quality: "A", hero_id: [100005] },
        { skill_id: 200801, name: "利兵谋胜", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100443,100801] },
        { skill_id: 200886, name: "三军之众", season: 4, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100620,100619] },
        { skill_id: 200237, name: "妖术", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100005,100028] },
        { skill_id: 200235, name: "浑水摸鱼", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100025,100029,100002] },
        { skill_id: 200263, name: "火烧连营", season: 4, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100791] },
        { skill_id: 200979, name: "及锋而试", season: 0, skill_type: 3, research_progress: 100, quality: "S", hero_id: [100701,100702,100703] },
        { skill_id: 200271, name: "袭屯夺气", season: 4, skill_type: 3, research_progress: 100, quality: "A", hero_id: [100794,100795] },
        { skill_id: 200267, name: "敛众定气", season: 4, skill_type: 3, research_progress: 100, quality: "A", hero_id: [100791,100792] }
      ];

      return activeSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generateChaseSkills() {
      // 追击技能示例
      const chaseSkills = [
        { skill_id: 200980, name: "乘胜追击", season: 0, skill_type: 4, research_progress: 100, quality: "S", hero_id: [100704,100705] },
      ];

      return chaseSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generatePassiveSkills() {
      // 被动技能示例
      const passiveSkills = [
        { skill_id: 200252, name: "百战无怯", season: 0, skill_type: 1, research_progress: 100, quality: "S", hero_id: [100587,100785] },
        { skill_id: 200788, name: "枭雄", season: 2, skill_type: 1, research_progress: 100, quality: "A", hero_id: [100023] },
        { skill_id: 200863, name: "击势", season: 0, skill_type: 1, research_progress: 100, quality: "S", hero_id: [100615,100616] },
        { skill_id: 200900, name: "垒实迎击", season: 4, skill_type: 1, research_progress: 100, quality: "S", hero_id: [100630,100631] },
        { skill_id: 200280, name: "令无空悬", season: 4, skill_type: 1, research_progress: 100, quality: "A", hero_id: [100802,100810] },
        { skill_id: 200274, name: "以诱待来", season: 0, skill_type: 1, research_progress: 100, quality: "A", hero_id: [100796,100811] },
        { skill_id: 200261, name: "胜敌益强", season: 0, skill_type: 1, research_progress: 100, quality: "A", hero_id: [100790,100793] },
        { skill_id: 200289, name: "先声夺人", season: 0, skill_type: 1, research_progress: 100, quality: "A", hero_id: [100805,100804,100803] }
      ];

      return passiveSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },
    updateSkillOpacity(skillIds) {
      const source = Array.isArray(skillIds) ? skillIds : []
      this.categories.forEach(category => {
        category.skills.forEach(skill => {
          //// 查找匹配的技能数据，使用skill_id作为匹配条件
          const matchedSkill = source.find(item => item.skill_id === skill.skill_id);
          if (matchedSkill) {
            skill.opacity = 1;// 恢复不透明
            skill.research_progress = matchedSkill.research_progress;
            if (matchedSkill.hero_id != null) skill.hero_id = this.normalizeHeroIds(matchedSkill.hero_id);

          }
        });
      });
      this.updateDismantleStatus()
    },
    updateDismantleStatus() {
      const ownedIds = new Set((this.uniqueCards || []).map(card => Number(card.hero_id)).filter(Number.isFinite))
      // 已拥有的战法不能再次通过武将拆除，优先按账号技能 ID 排除
      const accountSkills = Array.isArray(this.skillData)
        ? this.skillData
        : (this.skillData?.skills || this.skillData?.data || [])
      const ownedSkillIds = new Set(accountSkills
        .map(skill => Number(skill.skill_id ?? skill.id))
        .filter(Number.isFinite))
      this.categories.forEach(category => category.skills.forEach(skill => {
        const heroIds = this.normalizeHeroIds(skill.hero_id)
        skill.hero_id = heroIds
        skill.canDismantle = !ownedSkillIds.has(Number(skill.skill_id))
          && heroIds.length > 0
          && heroIds.some(id => ownedIds.has(id))
      }))
    },
    normalizeHeroIds(value) {
      const values = Array.isArray(value) ? value : (value == null ? [] : [value])
      return values.map(Number).filter(Number.isFinite)
    }
  }
}
</script>

<style scoped>
.skill-card-container {
  padding: 1px;
  margin-top: 15px;
}

.custom-add-panel { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.custom-add-panel input, .custom-add-panel select, .custom-add-panel button { min-height: 32px; padding: 4px 8px; }
.custom-add-panel input { min-width: 180px; }
.custom-add-panel button { cursor: pointer; }
.custom-add-panel button:disabled { cursor: not-allowed; opacity: .5; }
.add-trigger { width: 34px; height: 34px; font-size: 24px; line-height: 1; cursor: pointer; }
.list-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.add-dialog-mask { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.45); }
.add-dialog { width: min(92vw, 440px); max-height: 85vh; overflow: auto; padding: 20px; background: #fff; border-radius: 8px; }
.add-dialog input, .add-dialog select, .add-dialog > button { margin: 4px; padding: 8px; }
.search-results { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px; max-height: 56vh; overflow-y: auto; margin: 14px 4px; padding: 4px; }
.result-group { flex: 1 1 100%; }
.result-group-title { margin: 8px 0; padding-bottom: 5px; border-bottom: 1px solid #ebeef5; color: #606266; font-size: 14px; font-weight: 600; }
.result-group-items { display: flex; flex-wrap: wrap; gap: 12px; }
.result-item { position: relative; flex: 0 0 auto; cursor: pointer; }
.result-id { margin-top: 3px; color: #909399; font-size: 12px; text-align: center; }
.dialog-close { float: right; }
.managed-item { position: relative; }
.remove-item { position: absolute; top: -1px; right: -1px; z-index: 10; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: #c43d3d; cursor: pointer; opacity: 0; pointer-events: none; transition: opacity .15s; }
.managed-item:hover .remove-item { opacity: 1; pointer-events: auto; }

.category-section {
  margin-bottom: 30px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 25px;
}

.category-title {
  font-size: 14px;
  font-weight: bold;
  margin-top: 1px;
  margin-bottom: 5px;
  color: #333;
}

.category-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.category-title-row .category-title {
  margin-bottom: 0;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
