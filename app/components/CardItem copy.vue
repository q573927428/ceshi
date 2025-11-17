<template>
  <li class="wujiang-item item">
    <div>
      
    </div>
    <div class="wrap">
      <img :src="imageUrl" loading="lazy" class="image">
      <div class="bg bg5" :class="'bg' + stars"></div>
      <div class="state-wrap" :class="'state' + countryCode">
        <i class="ico">{{ country }}</i>
      </div>
      
      <!-- 季节徽章 -->
      <div v-if="season" class="season-wrap" :class="'season-' + season">
        <i class="ico">{{ season }}</i>
      </div>
      
      <div class="stars">
        <span 
          v-for="star in 5" 
          :key="star" 
          class="star"
          :class="{ active: star <= stars }"
        >
          <i class="ico"></i>
        </span>
      </div>
      
      <div class="name tC tof">
        {{ name }}
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'CardItem',
  props: {
    imageUrl: {
      type: String,
      default: 'https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_100009.jpg'
    },
    country: {
      type: String,
      default: '群'
    },
    countryCode: {
      type: [String, Number],
      default: '5'
    },
    name: {
      type: String,
      default: '董卓'
    },
    stars: {
      type: Number,
      default: 5
    },
    season: {
      type: String,
      default: 'N'
    }
  }
}
</script>

<style scoped>
.wujiang-item {
  list-style: none;
  width: 136px;
  margin-bottom: 15px;
}

.wrap {
  position: relative;
  width: 136px;
  height: 180px;
  cursor: pointer;
}

.image {
  width: 100%;
  height: 100%;
  display: block;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  pointer-events: none;
}

.bg1 {
  background-image: url('/images/bg.png');
}

.bg2 {
  background-image: url('/images/bg.png');
}

.bg3 {
  background-image: url('/images/bg.png');
}

.bg4 {
  background-image: url('/images/bg.png');
}

.bg5 {
  background-image: url('/images/bg.png');
}

.state-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  z-index: 2;
}

.state1 {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-state.45757d1.png') no-repeat;
  background-position: 0 0;
}

.state2 {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-state.45757d1.png') no-repeat;
  background-position: -28px 0;
}

.state3 {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-state.45757d1.png') no-repeat;
  background-position: -56px 0;
}

.state4 {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-state.45757d1.png') no-repeat;
  background-position: -84px 0;
}

.state5 {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-state.45757d1.png') no-repeat;
  background-position: -112px 0;
}

.season-wrap {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  z-index: 2;
}

.season-N {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-season.e3507dc.png') no-repeat;
  background-position: 0 0;
}

.season-S {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-season.e3507dc.png') no-repeat;
  background-position: -28px 0;
}

.stars {
  position: absolute;
  bottom: 24px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 2;
}

.star {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin: 0 1px;
}

.star .ico {
  display: inline-block;
  width: 100%;
  height: 100%;
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-star.0f1a350.png') no-repeat;
  background-size: 100%;
}

.star.active .ico {
  background: url('https://cbg-stzb.res.netease.com/game_res/web/images-n/n-star-active.04854bc.png') no-repeat;
  background-size: 100%;
}

.name {
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: #333;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>