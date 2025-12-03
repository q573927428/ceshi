<template>
  <div class="formation-container">
    <!-- 使用Element Plus的Collapse折叠面板 -->
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item 
        v-for="(category, index) in formationGroups" 
        :key="index" 
        :name="index"
        :title="category.category"
      >
        <div class="formation-cards" :class="{ 'single-column': singleColumn }">
          <div 
            v-for="(team, teamIndex) in category.teams" 
            :key="teamIndex" 
            class="team-group"
            :class="{ 
              'team-group-max-advance': team.totalAdvanceNum >= 15,
              'team-group-medium-advance': team.totalAdvanceNum >= 10 && team.totalAdvanceNum < 15
            }"
          >
            <div class="team-title">{{ team.title }} （ <span class="team-total-advance"> {{ team.totalAdvanceNum }} </span> 红 ）</div>
            <div class="team-cards">
              <CardItem
                v-for="card in team.cards" 
                :key="card.hero_id" 
                :name="card.name"
                :country="card.country"
                :quality="card.quality"
                :awake_state="card.awake_state"
                :policy_awake_state="card.policy_awake_state"
                :hero_achieve="card.hero_achieve"
                :advance_num="card.advance_num"
                :season="card.season"
                :hero_id="card.hero_id"
                :image-url="getImageUrl(card)"
              />
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import CardItem from './CardItem.vue';

export default {
  components: {
    CardItem
  },
  props: {
    uniqueCards: {
      type: Array,
      required: true
    },
    singleColumn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeNames: '0' // 默认展开第一个折叠项
    };
  },
  computed: {
    formationGroups() {
      // 防御性检查：如果 uniqueCards 为空，则返回空数组
      if (!this.uniqueCards || this.uniqueCards.length === 0) {
        return [];
      }

      // 定义8种队伍分类及其具体组合
      const formations = [
        {
          category: '开荒',
          teams: [
            { title: '大黄乐', heroes: [100619, 100020, 100685] },
            { title: '大黄机', heroes: [100619, 100020, 100526] },
            { title: '大乔祝融', heroes: [100619, 100494, 100685] },
            { title: '马魏甄', heroes: [100013, 100649, 100015] }
          ]
        },
        {
          category: '垒石',
          teams: [
            { title: '钱步', heroes: [100703, 100708, 100709] },
            { title: '庞统刘备司马懿', heroes: [100477, 100016, 100807] },
            { title: '大桥流氓', heroes: [100619, 100526, 100030] },
            { title: '鲁肃大桥流氓', heroes: [100619, 100526, 100741] },
            { title: '鬼吕流氓', heroes: [100479, 100526, 100030] },
            { title: '吕布网红', heroes: [100479, 100337, 100526] },
            { title: '大章鱼', heroes: [100619, 100526, 100787] },
            { title: 'XP周瑜打火机', heroes: [100478, 100526, 100784] },
            { title: '李儒流氓', heroes: [100604, 100526, 100030] },
            { title: '赵无敌', heroes: [100021, 100526, 100649] },
            { title: '周泰张机肉步', heroes: [100574, 100526, 100589] },
            { title: '大张张', heroes: [100619, 100526, 100648] },
            { title: '爷爷队', heroes: [100574, 100526, 100630] },
            { title: '庞统章鱼', heroes: [100477, 100526, 100787] },
            { title: '姜维流氓', heroes: [100021, 100526, 102012] },
            { title: 'SP赵无敌', heroes: [102001, 100526, 102012] },
            { title: '黄无敌', heroes: [100526, 100649, 100630] },
            { title: '鬼无敌', heroes: [100479, 100526, 100649] },
            { title: '肉弓', heroes: [100604, 100526, 100479] },
            { title: '赵诸魏', heroes: [100021, 100496, 100649] }
            
          ]
        },
        {
          category: '神兵大赏',
          teams: [
            { title: '朱马刀', heroes: [100024, 100807, 100553] },
            { title: '司马懿核弹', heroes: [100474, 100807, 100553] },
            { title: '狗刀', heroes: [100024, 100035, 100023] },
            { title: '王异法刀', heroes: [100028, 100035, 100023] },
            { title: '杜预卫瓘法刀', heroes: [100705, 100707, 100035] },
            { title: '曹操杜预法刀', heroes: [100705, 100035, 100023] },
            { title: '属性队', heroes: [100794, 100771, 100474] },
            { title: '陈宫袁绍刀', heroes: [100670, 100443, 100035] },
            { title: '李儒袁绍刀', heroes: [100670, 100604, 100035] },
            { title: '田丰袁绍刀', heroes: [100670, 100035, 100692] },
            { title: '鬼神刀', heroes: [100479, 100035, 100692] },
            { title: '核弹', heroes: [100604, 100474, 100035] },
            { title: '朱儁核弹', heroes: [100604, 100474, 100553] },
            { title: '战龙刀', heroes: [100494, 100647, 100023] },
            { title: '大乔法刀', heroes: [100619, 100035, 100496] },
            { title: '大都督', heroes: [100478, 100031, 100035] },
            { title: '甘宁刀', heroes: [100034, 100574, 100035] },
            { title: '太史慈刀', heroes: [100090, 100031, 100035] }
            
          ]
        },
        {
          category: '战必磐阵',
          teams: [
            { title: '三马队', heroes: [100615, 100799, 100785] },
            { title: '程昱魏智', heroes: [100024, 100787, 100476] },
            { title: '多马队', heroes: [100701, 100687, 100476] },
            { title: '雨化田', heroes: [100451, 100647, 100692] },
            { title: '五虎队', heroes: [100022, 100451, 100021] },
            { title: '张绣蜀骑', heroes: [100615, 100451, 100620] },
            { title: '合纵蜀骑（一）', heroes: [100615, 100027, 100620] },
            { title: '合纵蜀骑（二）', heroes: [100615, 100645, 100620] },
            { title: '合纵蜀骑（三）', heroes: [100615, 100476, 100620] },
            { title: '徐庶蜀骑', heroes: [100615, 100451, 100534] },
            { title: '张飞流氓队', heroes: [100022, 100496, 100030] },
            { title: '普通魏智', heroes: [100024, 100618, 100476] }
          ]
        },
        {
          category: '攻其不备',
          teams: [
            { title: '小鸟刀', heroes: [100498, 100704, 100027] },
            { title: '曹纯刀', heroes: [100498, 100013, 100027] },
            { title: '鬼龙骑', heroes: [100479, 100498, 100023] },
            { title: '吕布撸铁', heroes: [100479, 100452, 100023] },
            { title: '大菜刀', heroes: [100013, 100027, 100023] },
            { title: '攒刀', heroes: [100677, 100013, 100027] },
            { title: '砍王', heroes: [100013, 100649, 100023] },
            { title: '华雄撸铁', heroes: [100647, 100452, 100023] },
            { title: '王异菜刀', heroes: [100028, 100027, 100023] }
          ]
        },
        {
          category: '百战',
          teams: [
            { title: '同心队', heroes: [100016, 100792, 100449] },
            { title: '夏侯螃蟹', heroes: [100024, 100023, 100449] },
            { title: '孙策螃蟹', heroes: [100450, 100023, 100449] },
            { title: '华雄螃蟹', heroes: [100647, 100023, 100449] },
            { title: '夏侯木鹿百战螃蟹', heroes: [100024, 100452, 100449] },
            { title: '关羽螃蟹', heroes: [100451, 100023, 100449] },
            { title: '百战钢板', heroes: [100016, 100480, 100020] }
          ]
        },
        {
          category: '形兵',
          teams: [
            { title: '孙权形兵', heroes: [100030, 100619, 100631] },
            { title: '李儒形兵', heroes: [100604, 100452, 100337] },
            { title: '吕布形兵', heroes: [100479, 100452, 100337] }
          ]
        },
        {
          category: '其他',
          teams: [
            { title: '横轭队', heroes: [100024, 100585, 100023] },
            { title: '免疫法刀队', heroes: [100452, 100519, 100337] },
            { title: '董卓刘备庞统钢板', heroes: [100477, 100016, 100480] }
          ]
        }
      ];

      // 构建最终的队伍分组结果
      const resultGroups = [];

      formations.forEach(category => {
        const validTeams = category.teams.filter(team => {
          // 检查用户是否拥有该队伍的所有3个武将 (使用hero_id进行匹配)
          return team.heroes.every(heroId => {
            return this.uniqueCards.some(card => card.hero_id === heroId);
          });
        });

        if (validTeams.length > 0) {
          // 为每个有效队伍添加卡片数据和总进阶数量
          const teamsWithCards = validTeams.map(team => {
            // 保持武将的指定顺序，不根据进阶状态排序
            const cards = team.heroes.map(heroId => {
              return this.uniqueCards.find(card => card.hero_id === heroId);
            }).filter(card => card !== undefined);
            
            // 计算队伍总进阶数量
            const totalAdvanceNum = cards.reduce((total, card) => total + (card.advance_num || 0), 0);
            
            return {
              ...team,
              cards,
              totalAdvanceNum
            };
          })
          // 根据总进阶数进行降序排序
          .sort((a, b) => b.totalAdvanceNum - a.totalAdvanceNum);

          resultGroups.push({
            ...category,
            teams: teamsWithCards
          });
        }
      });

      return resultGroups;
    }
  },
  methods: {
    getImageUrl(card) {
      if (card && card.icon_hero_id) {
        return `https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`;
      }
      // 返回默认图片占位符
      return 'https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_100000.jpg';
    }
  }
};
</script>

<style scoped>
.formation-container {
  padding-top: 15px;
}

.formation-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.formation-cards .single-column {
  grid-template-columns: 1fr 1fr;
}

@media (min-width: 1388px) {
  .formation-cards:not(.single-column) {
    grid-template-columns: 1fr 1fr;
  }
}

.team-group {
  margin: 5px auto;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #f7ecec;
  transition: background-color 0.3s;
}

.team-group-medium-advance {
  background-color: #f9c5c5;
}

.team-group-max-advance {
  background-color: #e77676;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.team-cards {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.team-title {
  font-size: 18px;
  font-weight: bold;
}

.team-total-advance {
  color: #d32f2f;
  font-size: 22px;
  font-weight: bold;
}

</style>