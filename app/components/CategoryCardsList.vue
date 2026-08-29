<template>  
  <div class="category-cards">
    <div class="list-toolbar"><span>武将列表</span><el-button type="primary" circle title="添加武将" @click="cardDialogOpen = true; cardSearchSubmitted = true">+</el-button></div>
    <el-dialog v-model="cardDialogOpen" title="添加武将" width="80%">
        <el-input v-model.trim="cardSearch" placeholder="输入武将名称" clearable @keyup.enter="searchCards"><template #append><el-button @click="searchCards">搜索</el-button></template></el-input>
        <el-select v-model="cardTargetCategory" style="width: 100%; margin-top: 12px;"><el-option v-for="category in categories" :key="category.name" :label="category.name" :value="category.name" /></el-select>
        <div v-if="cardSearchSubmitted" class="search-results">
          <div v-for="card in cardSearchResults" :key="card.id" class="result-item" @click="addSelectedCard(card)"><CardItem v-bind="card" /><div class="result-id">ID: {{ card.hero_id }}</div></div>
          <span v-if="!cardSearchResults.length">未找到匹配武将</span>
        </div>
    </el-dialog>
    <!-- 特殊类卡片 -->
    <div v-for="category in nonCollapsibleCategories" :key="category.name" class="category-section">
      <div class="category-title">{{ category.name }}</div>
      <div class="cards-container">
        <div v-for="card in category.cards" :key="card.hero_id" class="managed-item">
        <CardItem
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
        <button type="button" class="remove-item" title="删除" @click="removeCard(category, card)">×</button>
        </div>
      </div>
    </div>

    <!-- 可折叠部分 -->
    <div class="collapsible-section">
      <div class="toggle-button-container">
        <button @click="toggleCollapse" class="toggle-button">
          {{ isCollapsed ? '更多' : '收起' }}
          <el-icon class="icon">
            <ArrowDown v-if="isCollapsed" />
            <ArrowUp v-else />
          </el-icon>
        </button>
      </div>

      <div v-show="!isCollapsed">
        <div v-for="category in collapsibleCategories" :key="category.name" class="category-section">
          <div class="category-title">{{ category.name }}</div>
          <div class="cards-container">
            <div v-for="card in category.cards" :key="card.hero_id" class="managed-item">
            <CardItem
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
            <button type="button" class="remove-item" title="删除" @click="removeCard(category, card)">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CardItem from './CardItem.vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

export default {
  name: 'CategoryCards',
  components: {
    CardItem,
    ArrowDown,
    ArrowUp
  },
  props: {
    uniqueCards: {
      type: Array,
      default: () => []
    },
    customCards: {
      type: [Object, Array],
      default: () => ({})
    }
  },
  data() {
    const sCards = this.generateSCards();
    const aCards = this.generateACards();
    
    const categories = [
      {
        name: '特殊',
        cards: this.generateSpecialCards()
      },
      {
        name: '超核心SSS',
        cards: this.generateSSSCards()
      },
      {
        name: '大核心SS',
        cards: this.generateSSCards()
      },
      {
        name: '小核心S',
        cards: sCards
      },
      {
        name: '中间A',
        cards: aCards
      }
    ]
    this.appendCustomCards(categories, this.loadStoredCards())
    this.appendCustomCards(categories, this.customCards)
    return {
      isCollapsed: true,
      sCardsCount: sCards.length,
      aCardsCount: aCards.length,
      categories,
      cardSearch: '',
      selectedCardId: null,
      cardTargetCategory: categories[0].name
      ,cardDialogOpen: false, cardSearchSubmitted: false
    }
  },
  watch: {
    cardSearch() {
      this.selectedCardId = this.cardSearchResults[0]?.hero_id || null
      this.cardSearchSubmitted = false
    },
    uniqueCards: {
      handler(newVal) {
        this.updateCardOpacity(newVal);
      },
      immediate: true
    }
  },
  computed: {
    cardSearchResults() {
      const query = this.cardSearch.toLowerCase()
      const existingIds = new Set(this.categories.flatMap(category => category.cards.map(card => card.hero_id)))
      const unique = new Map()
      this.uniqueCards.forEach(rawCard => {
        const heroId = rawCard.hero_id ?? rawCard.id
        // 兼容历史缓存数据：旧记录没有 country 时，从内置卡片配置回填
        const configuredCard = this.categories
          .flatMap(category => category.cards)
          .find(item => item.hero_id === heroId)
        const country = rawCard.country ?? rawCard.country_id ?? rawCard.faction ?? configuredCard?.country ?? 5
        const card = { ...rawCard, hero_id: heroId, country: Number(country), name: rawCard.name || rawCard.hero_name }
        if (card.hero_id != null && !unique.has(card.hero_id)) {
          const iconHeroId = card.icon_hero_id || card.hero_id
          unique.set(card.hero_id, { ...card, id: `account-${card.hero_id}`, imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${iconHeroId}.jpg`, opacity: 1 })
        }
      })
      return [...unique.values()].filter(card => String(card.name || '').toLowerCase().includes(query))
    },
    selectedCard() { return this.cardSearchResults.find(card => card.hero_id === this.selectedCardId) },
    // 不可折叠的分类（前面的分类）
    nonCollapsibleCategories() {
      return this.categories.slice(0, 3);
    },
    // 可折叠的分类（小核心S类和中间A类）
    collapsibleCategories() {
      return this.categories.slice(3);
    }
  },
  methods: {
    loadStoredCards() { try { return JSON.parse(localStorage.getItem('stzb-custom-cards') || '{}') } catch { return {} } },
    persistCustomCards() {
      const result = {}
      this.categories.forEach(category => { const items = category.cards.filter(card => card._customAdded); if (items.length) result[category.name] = items })
      localStorage.setItem('stzb-custom-cards', JSON.stringify(result))
    },
    searchCards() { this.cardSearchSubmitted = true },
    addSelectedCard(card = this.selectedCard) {
      if (!card) return
      const target = this.categories.find(category => category.name === this.cardTargetCategory)
      if (!target || target.cards.some(item => item.hero_id === card.hero_id)) return
      target.cards.push({ ...card, opacity: 1, _customAdded: true })
      this.persistCustomCards()
      this.cardDialogOpen = false
    },
    removeCard(category, card) {
      category.cards = category.cards.filter(item => item.hero_id !== card.hero_id)
      this.persistCustomCards()
    },
    appendCustomCards(categories, customCards) {
      const entries = Array.isArray(customCards)
        ? customCards
        : Object.entries(customCards || {}).flatMap(([category, cards]) =>
            (Array.isArray(cards) ? cards : [cards]).map(card => ({ category, card }))
          )
      entries.forEach(entry => {
        const categoryName = entry.category || entry.group || entry.categoryName
        const card = entry.card || entry.item || entry
        const target = categories.find(category => category.name === categoryName)
        if (!target || !card || card.hero_id == null) return
        if (target.cards.some(item => item.hero_id === card.hero_id)) return
        const iconHeroId = card.icon_hero_id || card.hero_id
        target.cards.push({
          id: card.id || `custom-${card.hero_id}`,
          country: 0,
          quality: 5,
          awake_state: 0,
          policy_awake_state: 0,
          hero_achieve: 0,
          advance_num: 0,
          is_support: false,
          season: 'N',
          opacity: 0.3,
          imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${iconHeroId}.jpg`,
          ...card,
          imageUrl: card.imageUrl || `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${iconHeroId}.jpg`,
          _customAdded: true
        })
      })
    },

    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },

    generateSpecialCards() {
      // 特殊类卡片 - 5个
      const specialCardsData = [
        { id: 1, name: '王异', country: 2, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100028, icon_hero_id: 100028 },
        { id: 3, name: '吕布', country: 5, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100479, icon_hero_id: 100479 },
        { id: 4, name: '庞统', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100477, icon_hero_id: 100477 },
        { id: 5, name: '郭嘉', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100476, icon_hero_id: 100476 },
        { id: 6, name: '陆逊', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100478, icon_hero_id: 100478 },
        { id: 7, name: '董卓', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100480, icon_hero_id: 100480 },
        { id: 8, name: '曹纯', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100498, icon_hero_id: 100498 },
        { id: 9, name: '诸葛亮', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100496, icon_hero_id: 100496 },
      ];

      return specialCardsData.map(card => ({
        ...card,
        imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`,
        opacity: 0.3 // 默认透明度
      }));
    },

    generateSSSCards() {
      // 超核心SSS类卡片 - 9个
      const sssCardsData = [
        { id: 1, name: '张机', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100526, icon_hero_id: 100526 },
        { id: 3, name: '孙权', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100030, icon_hero_id: 100030 },
        { id: 4, name: '刘备', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100016, icon_hero_id: 100016 },
        { id: 2, name: '吕蒙', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100035, icon_hero_id: 100035 },
        { id: 5, name: '曹操', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100023, icon_hero_id: 100023 },
        { id: 6, name: '张辽', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100027, icon_hero_id: 100027 },
        { id: 7, name: '马超', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100013, icon_hero_id: 100013 },
        { id: 8, name: '关羽', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100451, icon_hero_id: 100451 },
        { id: 8, name: '司马懿', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100807, icon_hero_id: 100807 },
      ];

      return sssCardsData.map(card => ({
        ...card,
        imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`,
        opacity: 0.3 // 默认透明度
      }));
    },

    generateSSCards() {
      // 大核心SS类卡片 - 14个
      const ssCardsData = [
      { id: 1, name: '大桥', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100619, icon_hero_id: 100619 },
        { id: 3, name: '马岱', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100615, icon_hero_id: 100615 },
        { id: 5, name: '貂蝉', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100337, icon_hero_id: 100337 },
        { id: 7, name: '乐进', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100685, icon_hero_id: 100685 },
        { id: 82, name: '曹彰', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100683, icon_hero_id: 100683 },
        { id: 2, name: '田丰', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100692, icon_hero_id: 100692 },
        { id: 40, name: '魏延', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100649, icon_hero_id: 100649 },
        { id: 11, name: '程昱', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100787, icon_hero_id: 100787 },
        { id: 96, name: '沮授', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100771, icon_hero_id: 100771 },
        { id: 97, name: '荀彧', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100794, icon_hero_id: 100794 },
        { id: 9, name: '文鸯', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100704, icon_hero_id: 100704 },
        { id: 10, name: '司马炎', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100703, icon_hero_id: 100703 },
        { id: 48, name: '贾充', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100708, icon_hero_id: 100708 },
        { id: 37, name: '羊祜', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100709, icon_hero_id: 100709 },
        { id: 46, name: '马良', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100792, icon_hero_id: 100792 },
        { id: 45, name: '马谡', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100799, icon_hero_id: 100799 },
        { id: 64, name: '马腾', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100785, icon_hero_id: 100785 },
        { id: 63, name: '典韦', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100769, icon_hero_id: 100769 },
        { id: 2, name: '刘徽', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100814, icon_hero_id: 100814 },
        { id: 62, name: '黄盖', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100783, icon_hero_id: 100783 },
        { id: 88, name: '袁术', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100790, icon_hero_id: 100790 },
        { id: 47, name: '张飞', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100022, icon_hero_id: 100022 },
        { id: 2, name: '妲己', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100372, icon_hero_id: 100372 },
      ];

      return ssCardsData.map(card => ({
        ...card,
        imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`,
        opacity: 0.3 // 默认透明度
      }));
    },

    generateSCards() {
      // 小核心S类卡片 - 39个
      const sCardsData = [
        { id: 28, name: '夏侯惇', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100449, icon_hero_id: 100449 },
        { id: 4, name: '袁绍', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100670, icon_hero_id: 100670 },
        { id: 29, name: '李儒', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100604, icon_hero_id: 100604 },
        { id: 30, name: '陈宫', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100443, icon_hero_id: 100443 },
        { id: 31, name: '张绣', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100620, icon_hero_id: 100620 },
        { id: 32, name: '赵云', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100021, icon_hero_id: 100021 },
        { id: 89, name: '赵云', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102001, icon_hero_id: 100021 },
        { id: 33, name: '张昭', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100648, icon_hero_id: 100648 },
        { id: 34, name: '姜维', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100074, icon_hero_id: 100074 },
        { id: 57, name: '姜维', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102012, icon_hero_id: 100074 },
        { id: 57, name: '姜维', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100806, icon_hero_id: 100806 },
        { id: 36, name: '陆抗', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100574, icon_hero_id: 100574 },
        { id: 38, name: '鲁肃', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100741, icon_hero_id: 100741 },
        { id: 39, name: '周泰', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100589, icon_hero_id: 100589 },
        { id: 41, name: '贾诩', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100618, icon_hero_id: 100618 },
        { id: 42, name: '蒋钦', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100671, icon_hero_id: 100671 },
        { id: 43, name: '徐晃', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100645, icon_hero_id: 100645 },
        { id: 44, name: '张宁', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100474, icon_hero_id: 100474 },
        { id: 49, name: '公孙瓒', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100677, icon_hero_id: 100677 },
        { id: 50, name: '周瑜', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100784, icon_hero_id: 100784 },
        { id: 51, name: '皇甫嵩', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100630, icon_hero_id: 100630 },
        { id: 52, name: '徐庶', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 100534, icon_hero_id: 100534 },
        { id: 53, name: '华雄', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100647, icon_hero_id: 100647 },
        { id: 54, name: '木鹿大王', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100452, icon_hero_id: 100452 },
        { id: 55, name: '司马师', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100701, icon_hero_id: 100701 },
        { id: 56, name: '杜预', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100705, icon_hero_id: 100705 },
        { id: 58, name: '于禁', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100796, icon_hero_id: 100796 },
        { id: 59, name: '陆逊', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100791, icon_hero_id: 100791 },
        { id: 60, name: '左慈', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100802, icon_hero_id: 100802 },
        { id: 61, name: '孙坚', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100805, icon_hero_id: 100805 },
        { id: 6, name: '孙权', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100808, icon_hero_id: 100808 },
        { id: 63, name: '孟获', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100815, icon_hero_id: 100815 },
        { id: 65, name: '小乔', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100687, icon_hero_id: 100687 }
      ];

      return sCardsData.map(card => ({
        ...card,
        imageUrl: `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`,
        opacity: 0.3 // 默认透明度
      }));
    },

    generateACards() {
      // 中间A类卡片 - 30个
      const aCardsData = [
        { id: 66, name: '关银屏', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100072, icon_hero_id: 100072 },
        { id: 67, name: '孙策', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100450, icon_hero_id: 100450 },
        { id: 68, name: '张姬', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100358, icon_hero_id: 100358 },
        { id: 69, name: '黄月英', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100020, icon_hero_id: 100020 },
        { id: 70, name: '凌统', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100616, icon_hero_id: 100616 },
        { id: 71, name: '甘宁', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100034, icon_hero_id: 100034 },
        { id: 72, name: '太史慈', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100090, icon_hero_id: 100090 },
        { id: 99, name: '太史慈', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102003, icon_hero_id: 100090 },
        { id: 73, name: '荀彧', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100024, icon_hero_id: 100024 },
        { id: 74, name: '吕布', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100003, icon_hero_id: 100003 },
        { id: 75, name: '严颜', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100631, icon_hero_id: 100631 },
        { id: 76, name: '兀突骨', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100519, icon_hero_id: 100519 },
        { id: 77, name: '法正', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100582, icon_hero_id: 100582 },
        { id: 78, name: '朱儁', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 100553, icon_hero_id: 100553 },
        { id: 79, name: '丁奉', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100788, icon_hero_id: 100788 },
        { id: 80, name: '刘禅', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100689, icon_hero_id: 100689 },
        { id: 81, name: '关兴&张苞', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100653, icon_hero_id: 100653 },
        { id: 83, name: '卫瓘', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100707, icon_hero_id: 100707 },
        { id: 84, name: '祝融夫人', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100494, icon_hero_id: 100494 },
        { id: 92, name: '祝融夫人', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102016, icon_hero_id: 100494 },
        { id: 85, name: '马云禄', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100019, icon_hero_id: 100019 },
        { id: 86, name: '司马昭', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100702, icon_hero_id: 100702 },
        { id: 87, name: '沙摩柯', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100524, icon_hero_id: 100524 },
        { id: 90, name: '献帝', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100795, icon_hero_id: 100795 },
        { id: 91, name: '裴秀', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100801, icon_hero_id: 100801 },
        { id: 93, name: '蒋琬', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100800, icon_hero_id: 100800 },
        { id: 94, name: '周仓', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100691, icon_hero_id: 100691 },
        { id: 95, name: '陈到', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100793, icon_hero_id: 100793 }
      ];

      return aCardsData.map(card => ({
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
            card.advance_num = matchedCard.advance_num;
            const country = matchedCard.country ?? matchedCard.country_id ?? matchedCard.faction
            if (country != null) card.country = Number(country)
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

.custom-add-panel { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.custom-add-panel input, .custom-add-panel select, .custom-add-panel button { min-height: 32px; padding: 4px 8px; }
.custom-add-panel input { min-width: 180px; }
.custom-add-panel button { cursor: pointer; }
.custom-add-panel button:disabled { cursor: not-allowed; opacity: .5; }
.add-trigger { width: 34px; height: 34px; font-size: 24px; line-height: 1; cursor: pointer; }
.list-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.add-dialog-mask { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.45); }
.add-dialog { width: min(92vw, 440px); max-height: 85vh; overflow: auto; padding: 20px; background: #fff; border-radius: 8px; }
.add-dialog input, .add-dialog select, .add-dialog > button { margin: 4px; padding: 8px; }
.search-results { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px; max-height: 56vh; overflow-y: auto; margin: 14px 4px; padding: 4px; }
.result-item { position: relative; flex: 0 0 auto; cursor: pointer; }
.result-id { margin-top: 3px; color: #909399; font-size: 12px; text-align: center; }
.dialog-close { float: right; }
.managed-item { position: relative; }
.remove-item { position: absolute; top: -6px; right: -6px; z-index: 2; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: #c43d3d; cursor: pointer; opacity: 0; pointer-events: none; transition: opacity .15s; }
.managed-item:hover .remove-item { opacity: 1; pointer-events: auto; }

.category-section {
  margin-bottom: 10px;
  background: #f5f5f5;
  padding: 15px ;
  border-radius: 25px;
  display: inline-block;
  margin-right: 8px;
  width: 100%;
}

.category-title {
  font-size: 14px;
  font-weight: bold;
  margin-top: 1px;
  margin-bottom: 5px;
  color: #333;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.collapsible-section {
  margin-top: 10px;
}

.toggle-button-container {
  text-align: center;
  margin-bottom: 10px;
}

.toggle-button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;       /* 横向排列 */
  align-items: center;        /* 垂直居中对齐 */
  gap: 4px;                   /* 文字与图标间距 */
  line-height: 1;             /* 避免行高导致偏移 */
}

.toggle-button:hover {
  background-color: #337ecc;
}
</style>
