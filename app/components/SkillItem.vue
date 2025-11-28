<template>
  <div class="skill-item" :style="{ opacity: opacity }">
    <div class="card-frame">
      <!-- 技能边框，根据品质不同而变化 -->
      <div class="quality-frame" :class="'quality-' + qualityLevel"></div>
      
      <!-- 技能背景，根据技能类型不同而变化 -->
      <div class="type-bg" :class="'type-' + skill_type"></div>
      
      <!-- 赛季标签，放在右上角 -->
      <div v-if="season && season !== 0" class="season-tag" >
        {{ seasonLabel }}
      </div>
      
      <!-- 研究状态遮罩 -->
      <div v-if="research_progress < 100" class="research-mask">
        <div class="research-text">{{ research_progress }}%</div>
      </div>
      
      <!-- 技能信息 -->
      <div class="skill-content">
        <div class="skill-name">{{ name }}</div>
        <!-- <div class="skill-type">{{ skillTypeName }}</div>
        <div class="skill-level">等级: {{ qualityLevel }}</div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkillItem',
  props: {
    skill_id: {
      type: Number,
      default: 201008
    },
    name: {
      type: String,
      default: '诱敌深入'
    },
    skill_info: {
      type: Array,
      default: () => []
    },
    season: {
      type: Number,
      default: 0
    },
    skill_type: {
      type: Number,
      default: 2
    },
    research_progress: {
      type: Number,
      default: 10
    },
    quality: {
      type: String,
      default: 'S'
    },
    opacity: {
      type: Number,
      default: 1
    }
  },
  computed: {
    // 技能品质等级(S/A/B/C/D)
    qualityLevel() {
      // 根据技能ID或其他规则确定品质，这里简化处理
      const quality = this.quality;
      if (quality === "S") return 'S';
      if (quality === "A") return 'A';
      if (quality === "B") return 'B';
      if (quality === "C") return 'C';
      return 'D';
    },
    
    // 技能类型名称
    skillTypeName() {
      const types = {
        1: '被动',
        2: '指挥',
        3: '主动',
        4: '追击'
      };
      return types[this.skill_type] || '未知';
    },
    
    // 赛季标签
    seasonLabel() {
      const seasons = {
        0: '',
        2: 'S2',
        3: 'S3',
        4: 'XP'
      };
      return seasons[this.season] || '';
    }
  }
}
</script>

<style scoped>
.skill-item {
  width: 80px;
  height: 80px;
  margin: 5px;
  position: relative;
  display: inline-block;
}

.card-frame {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.quality-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 80px 80px;
  background-repeat: no-repeat;
  z-index: 1;
}

.quality-S {
  background-image: url('/images/skill-quality-s.png');
  background-size: 80px 80px;
}

.quality-A {
  background-image: url('/images/skill-quality-a.png');
  background-size: 80px 80px;
}

.quality-B {
  background-image: url('/images/skill-quality-b.png');
  background-size: 80px 80px;
}

.quality-C {
  background-image: url('/images/skill-quality-c.png');
  background-size: 80px 80px;
}

.quality-D {
  background-image: url('/images/skill-quality-d.png');
  background-size: 80px 80px;
}

.type-bg {
  position: absolute;
  top: 0;
  left: 10px;
  width: 100%;
  height: 100%;
  background-size: 80px 80px;
  background-repeat: no-repeat;
  z-index: 0;
}

.type-1 {
  background-image: url('/images/skill-type-1.png');
  background-size: 60px 60px;
}

.type-2 {
  background-image: url('/images/skill-type-2.png');
  background-size: 60px 60px;
}

.type-3 {
  background-image: url('/images/skill-type-3.png');
  background-size: 60px 60px;
}

.type-4 {
  background-image: url('/images/skill-type-4.png');
  background-size: 60px 60px;
}

.season-tag {
  position: absolute;
  top: 0px;
  right: -5px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  color: #a6a6a6;
  z-index: 3;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.research-mask {
  position: absolute;
  top: 3px;
  left: 10px;
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.research-text {
  color: white;
  font-size: 12px;
  text-align: center;
}

.skill-content {
  position: relative;
  z-index: 2;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.skill-name {
  font-size: 12px;
  color: #ffffff;
  text-align: center;
  padding-top: 52px;
}

.skill-type {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.skill-level {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #ff9900;
}
@media (max-width: 576px) {
  .skill-item {
    width: 80px;
    height: 80px;
    margin: 5px;
  }
  .quality-frame {
    background-size: 80px 80px;
  }
  .quality-A .quality-B .quality-C .quality-D .quality-S {
    background-size: 80px 80px;
  }
  .type-bg{
    left: 10px;
    background-size: 80px 80px;
  }
  .type-1, .type-2, .type-3, .type-4 {
    background-size: 60px 60px;
  }
  .season-tag {
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 10px;
  }
  .research-mask {
    top: 3px;
    left: 10px;
    width: 60px;
    height: 60px;
  }
  .research-text {
    font-size: 12px;
  }
  .skill-name {
    font-size: 12px;
    padding-top: 50px;
  }
}
</style>