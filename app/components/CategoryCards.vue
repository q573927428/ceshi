<template> 
  <div class="category-cards">
    <div v-for="category in categories" :key="category.name" class="category-section">
      <h2 class="category-title">{{ category.name }} ({{ category.cards.length }})</h2>
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
          cards: this.generateSCards()
        },
        {
          name: '中间A',
          cards: this.generateACards()
        }
      ]
    }
  },
  methods: {
    generateSpecialCards() {
      // 特殊类卡片 - 5个
      const specialCardsData = [
        { id: 1, name: '王异', country: 2, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100028, icon_hero_id: 100028 },
        { id: 2, name: '妲己', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100372, icon_hero_id: 100372 },
        { id: 3, name: '吕布', country: 5, quality: 5, awake_state: 1, policy_awake_state: 1, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100479, icon_hero_id: 100479 },
        { id: 4, name: '庞统', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100477, icon_hero_id: 100477 },
        { id: 5, name: '郭嘉', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100476, icon_hero_id: 100476 },
        { id: 6, name: '陆逊', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100478, icon_hero_id: 100478 },
        { id: 7, name: '董卓', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S2', hero_id: 100480, icon_hero_id: 100480 },
        { id: 8, name: '曹纯', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100498, icon_hero_id: 100498 },
        { id: 9, name: '诸葛亮', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'S3', hero_id: 100496, icon_hero_id: 100496 }
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
        { id: 2, name: '吕蒙', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100035, icon_hero_id: 100035 },
        { id: 3, name: '孙权', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100030, icon_hero_id: 100030 },
        { id: 4, name: '刘备', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100016, icon_hero_id: 100016 },
        { id: 5, name: '曹操', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100023, icon_hero_id: 100023 },
        { id: 6, name: '张辽', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100027, icon_hero_id: 100027 },
        { id: 7, name: '马超', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100013, icon_hero_id: 100013 },
        { id: 8, name: '关羽', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100451, icon_hero_id: 100451 }
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
        { id: 1, name: '大桥', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100619, icon_hero_id: 100619 },
        { id: 2, name: '田丰', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100692, icon_hero_id: 100692 },
        { id: 3, name: '马岱', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100615, icon_hero_id: 100615 },
        { id: 4, name: '袁绍', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100670, icon_hero_id: 100670 },
        { id: 5, name: '貂蝉', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100337, icon_hero_id: 100337 },
        { id: 6, name: '孙权', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100808, icon_hero_id: 100808 },
        { id: 7, name: '乐进', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100685, icon_hero_id: 100685 },
        { id: 8, name: '司马懿', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100807, icon_hero_id: 100807 },
        { id: 9, name: '文鸯', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100704, icon_hero_id: 100704 },
        { id: 10, name: '司马炎', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100703, icon_hero_id: 100703 },
        { id: 11, name: '程昱', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100787, icon_hero_id: 100787 },
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
        { id: 29, name: '李儒', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100604, icon_hero_id: 100604 },
        { id: 30, name: '陈宫', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100443, icon_hero_id: 100443 },
        { id: 31, name: '张绣', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100620, icon_hero_id: 100620 },
        { id: 32, name: '赵云', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100021, icon_hero_id: 100021 },
        { id: 89, name: '赵云', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102001, icon_hero_id: 100021 },
        { id: 33, name: '张昭', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100648, icon_hero_id: 100648 },
        { id: 34, name: '姜维', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100074, icon_hero_id: 100074 },
        { id: 57, name: '姜维', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102012, icon_hero_id: 100074 },
        { id: 36, name: '陆抗', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100574, icon_hero_id: 100574 },
        { id: 48, name: '贾充', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100708, icon_hero_id: 100708 },
        { id: 37, name: '羊祜', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100709, icon_hero_id: 100709 },
        { id: 38, name: '鲁肃', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100741, icon_hero_id: 100741 },
        { id: 39, name: '周泰', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100589, icon_hero_id: 100589 },
        { id: 40, name: '魏延', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100649, icon_hero_id: 100649 },
        { id: 41, name: '贾诩', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100618, icon_hero_id: 100618 },
        { id: 42, name: '蒋钦', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100671, icon_hero_id: 100671 },
        { id: 43, name: '徐晃', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100645, icon_hero_id: 100645 },
        { id: 44, name: '张宁', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100474, icon_hero_id: 100474 },
        { id: 45, name: '马骥', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100799, icon_hero_id: 100799 },
        { id: 46, name: '马良', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100792, icon_hero_id: 100792 },
        { id: 47, name: '张飞', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100022, icon_hero_id: 100022 },
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
        { id: 62, name: '黄盖', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100783, icon_hero_id: 100783 },
        { id: 63, name: '典韦', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100769, icon_hero_id: 100769 },
        { id: 64, name: '马腾', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100785, icon_hero_id: 100785 },
        { id: 96, name: '沮授', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100771, icon_hero_id: 100771 },
        { id: 97, name: '荀彧', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100794, icon_hero_id: 100794 },
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
        { id: 73, name: '荀彧', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100024, icon_hero_id: 100024 },
        { id: 74, name: '吕布', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100003, icon_hero_id: 100003 },
        { id: 75, name: '严颜', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100631, icon_hero_id: 100631 },
        { id: 76, name: '兀突骨', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100519, icon_hero_id: 100519 },
        { id: 77, name: '法正', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100582, icon_hero_id: 100582 },
        { id: 78, name: '朱儁', country: 1, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 100553, icon_hero_id: 100553 },
        { id: 79, name: '丁奉', country: 4, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100788, icon_hero_id: 100788 },
        { id: 80, name: '刘禅', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100689, icon_hero_id: 100689 },
        { id: 81, name: '关兴&张苞', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100653, icon_hero_id: 100653 },
        { id: 82, name: '曹彰', country: 2, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'XP', hero_id: 100683, icon_hero_id: 100683 },
        { id: 83, name: '卫瓘', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100707, icon_hero_id: 100707 },
        { id: 84, name: '祝融夫人', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100494, icon_hero_id: 100494 },
        { id: 92, name: '祝融夫人', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'SP', hero_id: 102016, icon_hero_id: 100494 },
        { id: 85, name: '马云禄', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100019, icon_hero_id: 100019 },
        { id: 86, name: '司马昭', country: 6, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100702, icon_hero_id: 100702 },
        { id: 87, name: '沙摩柯', country: 3, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100524, icon_hero_id: 100524 },
        { id: 88, name: '袁术', country: 5, quality: 5, awake_state: 1, policy_awake_state: 0, hero_achieve: 0, advance_num: 0, is_support: false, season: 'N', hero_id: 100790, icon_hero_id: 100790 },
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
  padding: 10px 0;
}

.category-section {
  margin-bottom: 30px;
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