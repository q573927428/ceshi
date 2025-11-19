<template>
  <div class="skill-card-container">
    <div v-for="category in categories" :key="category.name" class="category-section">
      <h2 class="category-title">{{ category.name }} ({{ category.skills.length }})</h2>
      <div class="skills-container">
        <SkillItem
          v-for="skill in category.skills"
          :key="skill.skill_id"
          v-bind="skill"
        />
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
  data() {
    return {
      categories: [
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
    }
  },
  methods: {
    generateCommandSkills() {
      // 指挥技能示例
      const commandSkills = [
        { skill_id: 200244, name: "正始之变", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200755, name: "攻其不备", skill_info: [], season: 3, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200784, name: "桃园结义", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200862, name: "单骑救主", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200754, name: "胜兵求战", skill_info: [], season: 3, skill_type: 2, research_progress: 100, quality: "B" },
        { skill_id: 200959, name: "久战熟谋", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200964, name: "合纵连横", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 201008, name: "诱敌深入", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200201, name: "无心恋战", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200276, name: "除恶务尽", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "S" }
      ];

      return commandSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generateActiveSkills() {
      // 主动技能示例
      const activeSkills = [
        { skill_id: 200847, name: "河内世泽", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200938, name: "三术奇谋", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200647, name: "一骑当千", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200814, name: "汜水关", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200844, name: "鼎足江东", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200789, name: "凤仪亭", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200263, name: "火烧连营", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200979, name: "及锋而试", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200801, name: "利兵谋胜", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200886, name: "三军之众", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200237, name: "妖术", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200235, name: "浑水摸鱼", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200271, name: "袭屯夺气", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200267, name: "敛众定气", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "A" }
      ];

      return activeSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generateChaseSkills() {
      // 追击技能示例
      const chaseSkills = [
        { skill_id: 200980, name: "乘胜追击", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
      ];

      return chaseSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },

    generatePassiveSkills() {
      // 被动技能示例
      const passiveSkills = [
        { skill_id: 200252, name: "百战无怯", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200788, name: "枭雄", skill_info: [], season: 2, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200863, name: "击势", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200900, name: "垒实迎击", skill_info: [], season: 4, skill_type: 2, research_progress: 100, quality: "S" },
        { skill_id: 200274, name: "以诱待来", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200261, name: "胜敌益强", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "A" },
        { skill_id: 200289, name: "先声夺人", skill_info: [], season: 0, skill_type: 2, research_progress: 100, quality: "A" }
      ];

      return passiveSkills.map(skill => ({
        ...skill,
        opacity: 0.3
      }));
    },
    updateSkillOpacity(skillIds) {
      this.categories.forEach(category => {
        category.skills.forEach(skill => {
          //// 查找匹配的技能数据，使用skill_id作为匹配条件
          const matchedSkill = skillIds.find(item => item.skill_id === skill.skill_id);
          if (matchedSkill) {
            skill.opacity = 1;// 恢复不透明
            skill.research_progress = matchedSkill.research_progress;

          }
        });
      });
    }
  }
}
</script>

<style scoped>
.skill-card-container {
  padding: 1px;
  margin-top: 15px;
}

.category-section {
  margin-bottom: 30px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 25px;
}

.category-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>