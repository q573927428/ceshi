<template>
  <div class="category-cards">
    <div v-for="category in categories" :key="category.name" class="category-section">
      <div class="cards-container">
        <CardItem
          v-for="card in category.cards"
          :key="card.id"
          :name="card.name"
          :image-url="card.imageUrl"
          :country="card.country"
          :quality="card.quality"
          :awake_state="card.awake_state"
          :policy_awake_state="card.policy_awake_state"
          :hero_achieve="card.hero_achieve"
          :advance_num="card.advance_num"
          :is_support="card.is_support"
          :season="card.season"
          :opacity="card.opacity"
          :hero_id="card.hero_id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CardItem from './CardItem.vue'

export default {
  name: 'CategoryCards',
  components: {
    CardItem
  },
  data() {
    return {
      categories: [
        {
          name: '特殊',
          cards: this.generateSpecialCards()
        }
      ]
    }
  },
  methods: {
    generateSpecialCards() {
      // 特殊类卡片 - 5个
      const specialCardsData = [
        { id: 3, name: '吕布', country: 5, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100479, icon_hero_id: 100479 },
        { id: 4, name: '庞统', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100477, icon_hero_id: 100477 },
        { id: 5, name: '郭嘉', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100476, icon_hero_id: 100476 },
        { id: 6, name: '陆逊', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100478, icon_hero_id: 100478 },
        { id: 7, name: '董卓', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100480, icon_hero_id: 100480 },
        { id: 8, name: '曹纯', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100498, icon_hero_id: 100498 },
        { id: 9, name: '诸葛亮', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100496, icon_hero_id: 100496 },
        { id: 1, name: '张机', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100526, icon_hero_id: 100526 },
        { id: 2, name: '吕蒙', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100035, icon_hero_id: 100035 },
        { id: 3, name: '孙权', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100030, icon_hero_id: 100030 },
        { id: 4, name: '刘备', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100016, icon_hero_id: 100016 },
        { id: 5, name: '曹操', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100023, icon_hero_id: 100023 },
        { id: 6, name: '张辽', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100027, icon_hero_id: 100027 },
        { id: 7, name: '马超', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100013, icon_hero_id: 100013 },
        { id: 8, name: '关羽', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100451, icon_hero_id: 100451 },
        { id: 1, name: '大桥', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100619, icon_hero_id: 100619 },
        { id: 1, name: '王异', country: 2, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100028, icon_hero_id: 100028 },
        { id: 7, name: '乐进', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100685, icon_hero_id: 100685 },
        { id: 8, name: '司马懿', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100807, icon_hero_id: 100807 },
        { id: 9, name: '文鸯', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100704, icon_hero_id: 100704 },
        { id: 11, name: '程昱', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100787, icon_hero_id: 100787 },
      ];

      return specialCardsData.map(card => ({
        ...card,
        imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`,
        opacity: 0.3 // 默认透明度
      }));
    },

    // 根据获取到的数据更新卡片透明度和进阶数的方法
    updateCardOpacity(uniqueCards) {
      this.categories.forEach(category => {
        category.cards.forEach(card => {
          // 查找匹配的卡片数据，使用icon_hero_id作为匹配条件
          const matchedCard = uniqueCards.find(c => c.hero_id === card.hero_id);
          
          if (matchedCard) {
            card.awake_state = matchedCard.awake_state;
            card.policy_awake_state = matchedCard.policy_awake_state;
            card.hero_achieve = 0;
            card.advance_num = matchedCard.advance_num;
            card.is_support = matchedCard.is_support;
            card.opacity = 1; // 恢复不透明
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.category-cards {
  padding: 5px 0;
}

.category-section {
  margin-bottom: 2px;
  background: #f5f5f5;
  padding: 15px ;
  border-radius: 25px;
}

.category-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>