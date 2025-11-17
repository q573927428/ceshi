<template>
  <div>
  <li class="wujiang-item item">
    <div class="wrap">
      <div class="card-frame">
        <div class="image-wrap">
          <img :src="imageUrl" loading="lazy" class="image">
          <div class="bg bg1"></div>
        </div>
        <div class="state-wrap" :class="'state' + country">
          <i class="ico"></i>
        </div>

        <!-- 极 -->
        <div v-if="awake_state == 1" class="ji-badge" :class="'ji-1' + policy_awake_state">
          <i class="ico"></i>
        </div>
        
        <!-- 季节徽章 -->
        <div v-if="season" class="season-wrap" :class="'season-' + season">
          <i class="ico"></i>
        </div>

        <!-- 成就 -->
        <div v-if="hero_achieve" class="hero-achieve" :class="'hero-achieve-' + hero_achieve">
          <i class="ico"></i>
        </div>
        
        <div class="stars">
          <span 
            v-for="star in 5" 
            :key="star" 
            class="star"
            :class="{ active: star <= advance_num }"
          >
            <i class="ico"></i>
          </span>
        </div>
        
        <div class="name">
          {{ name }}
        </div>
      </div>
    </div>
  </li>
  </div>
</template>

<script>
export default {
  name: 'CardItem',
  props: {
    name: {
      type: String,
      default: '董卓'
    },
    imageUrl: {
      type: String,
      default: 'https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_100009.jpg'
    },
    country: {
      type: Number,
      default: 5
    },
    quality: {
      type: Number,
      default: 5
    },
    awake_state: {
      type: Number,
      default: 1
    },  
    policy_awake_state: {
      type: Number,
      default: 1
    },
    hero_achieve: {
      type: Number,
      default: 1
    },
    advance_num: {
      type: Number,
      default: 5
    },
    is_support: {
      type: Boolean,
      default: false
    },
    season: {
      type: String,
      default: 'N'
    },
    hero_id: {
      type: Number,
      default: 100009
    },
    opacity: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style scoped>
.wujiang-item {
  list-style: none;
  width: 136px;
  margin: 15px auto;
  opacity: v-bind(opacity);
}

.wrap {
  position: relative;
  width: 136px;
  height: 200px;
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
  top: 5px;
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
  background: url('/images/state1.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.state2 {
  background: url('/images/state2.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.state3 {
  background: url('/images/state3.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.state4 {
  background: url('/images/state4.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.state5 {
  background: url('/images/state5.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.state6 {
  background: url('/images/state6.png') no-repeat;
  background-position: 0 0;
  background-size: 30px 30px;
}

.season-wrap {
  position: absolute;
  bottom: 20px;
  right: 0;
  width: 32px;
  height: 32px;
  line-height: 28px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  z-index: 2;
}

.season-N {
  background: url('/images/n.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.season-S2 {
  background: url('/images/s2.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.season-S3 {
  background: url('/images/s3.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.season-XP {
  background: url('/images/xp.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.season-SP {
  background: url('/images/sp.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.hero-achieve {
  position: absolute;
  bottom: 30px;
  left: 10px;
  width: 32px;
  height: 32px;
  line-height: 28px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  z-index: 2;
}
.hero-achieve-0 {
  background: url('/images/achieve0.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}
.hero-achieve-1 {
  background: url('/images/achieve1.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}
.hero-achieve-2 {
  background: url('/images/achieve2.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}
.hero-achieve-3 {
  background: url('/images/achieve3.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}
.hero-achieve-4 {
  background: url('/images/achieve4.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}
.hero-achieve-5 {
  background: url('/images/achieve5.png') no-repeat;      
 background-position: 0 0;  
  background-size: 32px 32px;
}


.ji-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 32px;
  height: 32px;
  line-height: 28px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-style: normal;
  z-index: 2;
}

.ji-10 {
  background: url('/images/ji10.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.ji-11 {
  background: url('/images/ji11.png') no-repeat;
  background-position: 0 0;
  background-size: 32px 32px;
}

.stars {
  position: absolute;
  bottom: 0px;
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
  background: url('/images/xin.png') no-repeat;
  background-size: 100%;
}

.star.active .ico {
  background: url('/images/xinon.png') no-repeat;
  background-size: 100%;
}

.name {
  position: absolute;
  top: 43px;
  left: 4px;
  width: 20px;
  height: 28px;
  text-align: center;
  color: #fbe385;
  font-style: normal;
  z-index: 2;
  font-size: 16px;
}
</style>
