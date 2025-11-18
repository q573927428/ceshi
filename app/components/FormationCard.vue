<template>
  <div class="formation-card">
    <div class="formation-card-header">
      <span class="formation-card-country">{{ card.country || '未知势力' }}</span>
    </div>
    <img 
      :src="imageUrl"
      :alt="card.name || '未知武将'"
      class="formation-card-image"
      @error="handleImageError"
    >
    <div class="formation-card-name">{{ card.name || '未知武将' }}</div>
    <div class="formation-card-details">
      <div class="formation-card-stars">
        <span v-for="n in (card.awake_state || 0)" :key="`filled-${n}`" class="star filled">★</span>
        <span v-for="n in (5 - (card.awake_state || 0))" :key="`empty-${n}`" class="star">★</span>
      </div>
      <div class="formation-card-policy">
        {{ (card.policy_awake_state || 0) }}政
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormationCard',
  props: {
    card: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageUrl() {
      if (this.card && this.card.icon_hero_id) {
        return `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${this.card.icon_hero_id}.jpg`;
      }
      // 返回默认图片占位符
      return 'https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_100000.jpg';
    }
  },
  methods: {
    handleImageError(event) {
      // 当图片加载失败时，设置为默认图片
      event.target.src = 'https://cbg-stzb.res.netease.com/game_res/cards/cut/card_default.jpg';
    }
  }
};
</script>

<style scoped>
.formation-card {
  text-align: center;
  width: 120px;
  padding: 8px;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.formation-card:hover {
  transform: translateY(-5px);
}

.formation-card-header {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.formation-card-country {
  font-size: 12px;
  color: #666;
  background-color: #eee;
  padding: 2px 6px;
  border-radius: 4px;
}

.formation-card-image {
  width: 100px;
  height: 140px;
  object-fit: cover;
  margin: 0 auto;
  border-radius: 4px;
}

.formation-card-name {
  font-weight: bold;
  margin-top: 8px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formation-card-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.formation-card-stars {
  display: flex;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star.filled {
  color: #ffcc00;
}

.formation-card-policy {
  background-color: #409eff;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>