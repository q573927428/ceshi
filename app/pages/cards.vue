<template>
  <div class="cards-page">
    <h1>武将卡分类展示</h1>
    <CategoryCards ref="categoryCards" />
    
    <div class="controls">
      <button @click="updateSomeCards">模拟更新部分卡片透明度</button>
      <button @click="resetOpacity">重置透明度</button>
    </div>
  </div>
</template>

<script>
import CategoryCards from '../components/CategoryCards.vue'

export default {
  components: {
    CategoryCards
  },
  methods: {
    updateSomeCards() {
      // 模拟从服务器获取到的卡片ID列表
      const ownedCardIds = [1, 3, 5, 7, 9, 15, 20, 35, 70, 80]
      this.$refs.categoryCards.updateCardOpacity(ownedCardIds)
    },
    
    resetOpacity() {
      // 重置所有卡片透明度
      this.$refs.categoryCards.categories.forEach(category => {
        category.cards.forEach(card => {
          card.opacity = 0.3
        })
      })
    }
  }
}
</script>

<style scoped>
.cards-page {
  padding: 20px;
}

.controls {
  margin-top: 20px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #66b1ff;
}
</style>