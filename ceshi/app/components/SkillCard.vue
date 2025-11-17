<template>
  <div class="skill-card" :style="{ opacity: opacity }">
    <!-- 技能等级边框 -->
    <div class="skill-border" :class="getBorderClass(skill.quality)">
      <!-- 赛季标签 -->
      <div v-if="skill.season !== 0" class="season-tag">
        {{ getSeasonLabel(skill.season) }}
      </div>

      <!-- 技能图标和信息 -->
      <div class="skill-content">
        <img :src="getBackgroundImage(skill.skill_type)" alt="技能背景" class="skill-background" />
        <div class="skill-name">{{ skill.name }}</div>
        <div class="skill-description">{{ skill.skill_info[1] }}</div>
        <div class="skill-category">{{ getCategoryName(skill.skill_type) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkillCard',
  props: {
    skill: {
      type: Object,
      required: true
    },
    visibleSkills: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    opacity() {
      // 如果技能在可见列表中，则设置为正常透明度
      return this.visibleSkills.some(s => s.skill_id === this.skill.skill_id) ? 1 : 0.5;
    }
  },
  methods: {
    getBorderClass(quality) {
      const qualityMap = {
        5: 's',
        4: 'a',
        3: 'b',
        2: 'c',
        1: 'd'
      };
      return `border-${qualityMap[quality] || 'd'}`;
    },
    getSeasonLabel(season) {
      const seasonMap = {
        2: 's2',
        3: 's3',
        4: 'XP'
      };
      return seasonMap[season] || '';
    },
    getBackgroundImage(skillType) {
      const typeMap = {
        1: '/public/images/skill-type-1.png', // 指挥
        2: '/public/images/skill-type-2.png', // 主动
        3: '/public/images/skill-type-3.png', // 追击
        4: '/public/images/skill-type-4.png'  // 被动
      };
      return typeMap[skillType] || '/public/images/skill-type-1.png';
    },
    getCategoryName(skillType) {
      const categoryMap = {
        1: '指挥',
        2: '主动',
        3: '追击',
        4: '被动'
      };
      return categoryMap[skillType] || '未知';
    }
  }
};
</script>

<style scoped>
.skill-card {
  position: relative;
  width: 120px;
  height: 160px;
  margin: 8px;
  transition: opacity 0.3s ease;
}

.skill-border {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.border-s {
  border: 4px solid #ff7f00; /* S级橙色边框 */
}

.border-a {
  border: 4px solid #00bfff; /* A级蓝色边框 */
}

.border-b {
  border: 4px solid #32cd32; /* B级绿色边框 */
}

.border-c {
  border: 4px solid #ffa500; /* C级橙色边框 */
}

.border-d {
  border: 4px solid #999; /* D级灰色边框 */
}

.season-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  background-color: #4CAF50;
  color: white;
  font-size: 10px;
  border-radius: 4px;
}

.skill-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  text-align: center;
}

.skill-background {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.skill-description {
  font-size: 10px;
  color: #666;
  line-height: 1.2;
  text-align: center;
  margin-bottom: 4px;
}

.skill-category {
  font-size: 10px;
  color: #999;
}
</style>