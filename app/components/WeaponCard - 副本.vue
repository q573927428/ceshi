<template>
  <div class="weapon-item item">
    <div class="wrap">
      <div class="img-container">
        <img :src="imageUrl" loading="lazy" class="image" />
      </div>
      
      <!-- 稀世图标 -->
      <div class="xishi-icon xishi-bg"></div>
      
      <!-- 极图标 -->
      <div class="best-wrap ji-bg"></div>
      
      <!-- 词条背景 -->
      <div class="citiao" :class="'citiao-' + (card.level_type || 0) + (card.advance || 0)" v-if="hasFeature">
        <div class="citiao-text">{{ card.feature[0][0] }}</div>
      </div>
      
      <!-- 边框背景 -->
      <div class="bg">
        <img src="/images/wqbk.png" alt="边框" />
      </div>

      <!-- 武器名称 -->
      <div class="name">{{ card.name }}</div>
      <div class="feature-text" v-if="hasFeature" v-html="highlightNumbers(card.feature[0][1])"></div>
    </div>
    
    
    
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

// 计算武器图片URL
const imageUrl = computed(() => {
  return `https://cbg-stzb.res.netease.com/game_res/gears/cut/gear_${props.card.gear_id}.jpg`
})

// 检查是否有feature数据
const hasFeature = computed(() => {
  return props.card.feature && Array.isArray(props.card.feature) && props.card.feature.length > 0
})

// 高亮数字部分
function highlightNumbers(text) {
  if (!text) return ''
  // 使用正则表达式匹配数字（包括小数），并给它们加上红色样式
  return text.replace(/(\d+(\.\d+)?)/g, '<span style="color:#f70d0d">$1</span>')
}

</script>

<style scoped>
.weapon-item {
  position: relative;
  display: inline-block;
  margin: 5px;
  height: 298px;
}

.wrap {
  position: relative;
  width: 170px;
  height: 242px;
}

.img-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.img-container .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg img {
  width: 100%;
  height: 100%;
}

.xishi-icon {
  position: absolute;
  top: 0;
  left: 8px;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 3;
}
.xishi-bg{
  background-image: url('/images/xishi_bg.png');
  background-size: 38px 100px;
}

.best-wrap {
  position: absolute;
  top: -15px;
  right: -145px;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 3;
}

.ji-bg {
  background-image: url('/images/ji10.png');
  background-size: 38px 38px;
}

.citiao {
  position: absolute;
  top: 100px;
  left: 8px;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 3;
}

.citiao-21 {
  background-image: url('/images/citiao_3.png');
  background-size: 38px 88px;
}

.citiao-20 {
  background-image: url('/images/citiao_2.png');
  background-size: 38px 88px;
}

.citiao-1 {
  background-image: url('/images/citiao_1.png');
  background-size: 38px 88px;
}

.citiao-00 {
  background-image: url('/images/citiao_0.png');
  background-size: 38px 88px;
}

.citiao-text {
  position: absolute;
  top: 20px;
  left: 10px;
  width: 20px;
  color: #dac6a2!important;
  font-size: 18px;
}

.name {
  position: relative;
  bottom: -250px;
  font-size: 14px;
  margin-top: 5px;
  z-index: 2;
}

.feature-text {
  position: relative;
  bottom: -250px;
  font-size: 12px;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  z-index: 2;
}

</style>