<template>
  <div class="baowu-item item">
    <div class="wrap">
      <div class="img-container">
        <img
          :src="`https://cbg-stzb.res.netease.com/game_res/gears/cut/gear_${card.gear_id}.jpg`"
          loading="lazy"
          class="image"
        />
      </div>

      <!-- 极图标 -->
      <div v-if="card.rare === 'ji'" class="best-wrap">
        <i class="ico grey">极</i>
      </div>

      <!-- 稀世图标 -->
      <div v-if="card.rare === 'xishi'" class="phase phase-3"></div>

      <!-- 词条背景 -->
      <div v-if="card.feature" class="feature" :class="getFeatureColor(card.feature)">
        <span class="feature-icon">{{ card.feature }}</span>
      </div>

      <!-- 边框背景 -->
      <div class="bg bg-default"></div>
    </div>

    <div class="name tC">{{ card.name }}</div>
  </div>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const getFeatureColor = (feature) => {
  if (feature.includes('红色')) return 'red';
  if (feature.includes('粉色')) return 'purple';
  if (feature.includes('蓝色')) return 'blue';
  return '';
};
</script>

<style scoped>
.baowu-item {
  width: 120px;
  height: 160px;
  margin: 5px;
  position: relative;
  display: inline-block;
}

.wrap {
  width: 100%;
  height: 100%;
  background-image: url('/images/wqbk.png');
  background-size: cover;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.img-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.best-wrap {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-image: url('/images/ji10.png');
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
}

.phase {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 20px;
  background-image: url('/images/xishi_bg.png');
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
}

.feature {
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 80px;
  height: 20px;
  background-image: url('/images/citiao_1.png');
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
  color: white;
  font-size: 12px;
  text-align: center;
  line-height: 20px;
}

.feature.red {
  color: #ff0000;
}

.feature.purple {
  color: #e91e63;
}

.feature.blue {
  color: #007bff;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.name {
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
}
</style>