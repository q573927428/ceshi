<template>
  <div class="zangbao-page">
    <!-- 页面标题 -->
    <!-- <el-page-header title="藏宝阁链接" /> -->

    <!-- 链接区域 -->
    <div class="link-section">
      <h3>藏宝阁链接对比:</h3>
      <div class="link-compare-container">
        <div class="link-input">
          <label>链接1:</label>
          <textarea 
            v-model="zangbaoLink1" 
            placeholder="请输入第一个藏宝阁链接"
          ></textarea>
        </div>
        <div class="link-input">
          <label>链接2:</label>
          <textarea 
            v-model="zangbaoLink2" 
            placeholder="请输入第二个藏宝阁链接"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 按钮区域 -->
    <div class="button-section">
      <el-button type="primary" @click="extractData">一键对比</el-button>
      <el-button type="primary" @click="resetOpacity">重置</el-button>
      <el-button type="info" @click="handleShare">历史记录</el-button>
    </div>

    <!-- 对比结果区域 -->
    <div class="compare-results" v-if="leftData || rightData">
      <div class="compare-container">
        <!-- 左侧数据 -->
        <div class="compare-panel" v-if="leftData">
          <div class="panel-header">
            <h3>链接1数据</h3>
          </div>
          <div class="panel-content">
            <div class="season-info" v-if="leftData.accountData && leftData.equip">
              <div class="season-item">
                <div><span>区服：</span> {{ leftData.equip.area_name }}  {{ leftData.equip.server_name }} </div>
                <div><span>状态：</span> {{ leftData.equip.status_desc }} </div>
              </div>
              <div class="season-item">
                <div><span>藏宝阁价格：</span> {{ leftData.equipPrice }} </div>
                <div><span>试师号价格：</span> {{ leftData.equipPriceShishi }} </div>
              </div>
            </div>
            
            <el-tabs v-model="leftActiveTab" class="tabs-assort">
              <el-tab-pane label="武将" name="first">
                <CategoryCards :ref="el => leftRefs.categoryCards = el" />
              </el-tab-pane>
              <el-tab-pane label="技能" name="second">
                <SkillCard :ref="el => leftRefs.skillCard = el" />
              </el-tab-pane>
              <el-tab-pane label="武器" name="third">
                <div v-if="leftData.accountData && leftData.accountData.gear" class="weapons-container">
                  <div class="weapon-group" v-if="leftData.redWeapons.length > 0">
                    <h3>红武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in leftData.redWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="leftData.pinkWeapons.length > 0">
                    <h3>粉武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in leftData.pinkWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="leftData.blueWeapons.length > 0">
                    <h3>蓝武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in leftData.blueWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="阵容" name="fourth">
                <FormationComponent 
                  v-if="leftData.uniqueCards && leftData.uniqueCards.length > 0" 
                  :uniqueCards="leftData.uniqueCards" 
                  :single-column="true"
                />
              </el-tab-pane>
              <el-tab-pane label="其他" name="fifth">
                <div class="other-resources">
                  <ul>
                    <li>虎符：{{ leftData.tenures.hufu }}</li>
                    <li>普通玉符：{{ leftData.tenures.bind_yuan_bao }}</li>
                    <li>四通玉符：{{ leftData.tenures.yuan_bao }}</li>
                    <li>将令：{{ leftData.tenures.jiang_ling }}</li>
                    <li>荣誉：{{ leftData.tenures.honor }}</li>
                    <li>赤珠山铁：{{ leftData.tenures.chi_zhu_shan_tie }}个</li>
                    <li>小叶紫檀：{{ leftData.tenures.xiao_ye_zi_tan }}个</li>
                    <li>天工锤：{{ leftData.tenures.gear_feature_hammer }}个</li>
                    <li>皮肤：{{ leftData.tenures.dynamic_icon }}个</li>
                  </ul>
                </div>
                <div class="dynamic_icon">
                  <div v-if="leftData.accountData && leftData.accountData.dynamic_icon" class="dynamic-icon-container">
                    <div 
                      v-for="card in leftData.accountData.dynamic_icon"
                      :key="card.icon_hero_id"
                      class="dynamic-icon-item"
                    >
                      <img 
                        :src="`https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`"
                        :alt="card.name"
                        class="dynamic-icon-image"
                      >
                      <div class="card-name">{{ card.name }}</div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 右侧数据 -->
        <div class="compare-panel" v-if="rightData">
          <div class="panel-header">
            <h3>链接2数据</h3>
          </div>
          <div class="panel-content">
            <div class="season-info" v-if="rightData.accountData && rightData.equip">
              <div class="season-item">
                <div><span>区服：</span> {{ rightData.equip.area_name }}  {{ rightData.equip.server_name }} </div>
                <div><span>状态：</span> {{ rightData.equip.status_desc }} </div>
              </div>
              <div class="season-item">
                <div><span>藏宝阁价格：</span> {{ rightData.equipPrice }} </div>
                <div><span>试师号价格：</span> {{ rightData.equipPriceShishi }} </div>
              </div>
            </div>
            
            <el-tabs v-model="rightActiveTab" class="tabs-assort">
              <el-tab-pane label="武将" name="first">
                <CategoryCards :ref="el => rightRefs.categoryCards = el" />
              </el-tab-pane>
              <el-tab-pane label="技能" name="second">
                <SkillCard :ref="el => rightRefs.skillCard = el" />
              </el-tab-pane>
              <el-tab-pane label="武器" name="third">
                <div v-if="rightData.accountData && rightData.accountData.gear" class="weapons-container">
                  <div class="weapon-group" v-if="rightData.redWeapons.length > 0">
                    <h3>红武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in rightData.redWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="rightData.pinkWeapons.length > 0">
                    <h3>粉武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in rightData.pinkWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="rightData.blueWeapons.length > 0">
                    <h3>蓝武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in rightData.blueWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="阵容" name="fourth">
                <FormationComponent 
                  v-if="rightData.uniqueCards && rightData.uniqueCards.length > 0" 
                  :uniqueCards="rightData.uniqueCards" 
                  :single-column="true"
                />
              </el-tab-pane>
              <el-tab-pane label="其他" name="fifth">
                <div class="other-resources">
                  <ul>
                    <li>虎符：{{ rightData.tenures.hufu }}</li>
                    <li>普通玉符：{{ rightData.tenures.bind_yuan_bao }}</li>
                    <li>四通玉符：{{ rightData.tenures.yuan_bao }}</li>
                    <li>将令：{{ rightData.tenures.jiang_ling }}</li>
                    <li>荣誉：{{ rightData.tenures.honor }}</li>
                    <li>赤珠山铁：{{ rightData.tenures.chi_zhu_shan_tie }}个</li>
                    <li>小叶紫檀：{{ rightData.tenures.xiao_ye_zi_tan }}个</li>
                    <li>天工锤：{{ rightData.tenures.gear_feature_hammer }}个</li>
                    <li>皮肤：{{ rightData.tenures.dynamic_icon }}个</li>
                  </ul>
                </div>
                <div class="dynamic_icon">
                  <div v-if="rightData.accountData && rightData.accountData.dynamic_icon" class="dynamic-icon-container">
                    <div 
                      v-for="card in rightData.accountData.dynamic_icon"
                      :key="card.icon_hero_id"
                      class="dynamic-icon-item"
                    >
                      <img 
                        :src="`https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`"
                        :alt="card.name"
                        class="dynamic-icon-image"
                      >
                      <div class="card-name">{{ card.name }}</div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录弹窗 -->
    <el-dialog v-model="historyDialogVisible" title="历史记录" width="80%" top="5vh">
      <HistoryRecord />
    </el-dialog>

  </div>
</template>

<script>
import CategoryCards from '~/components/CategoryCards.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponCard from '~/components/WeaponCard.vue';
import FormationComponent from '~/components/FormationComponent.vue';
import HistoryRecord from '~/components/HistoryRecord.vue';

export default {
  components: {
    CategoryCards,
    SkillCard,
    WeaponCard,
    FormationComponent,
    HistoryRecord
  },
  data() {
    return {
      zangbaoLink1: 'https://stzb.cbg.163.com/cgi/mweb/equip/1/202511061502116-1-T5MOTKPSF588HI',
      zangbaoLink2: 'https://stzb.cbg.163.com/cgi/mweb/equip/1/202510281502116-1-RU4G0IXMKDLWYW',
      leftActiveTab: 'first',
      rightActiveTab: 'first',
      leftRefs: {
        categoryCards: null,
        skillCard: null
      },
      rightRefs: {
        categoryCards: null,
        skillCard: null
      },
      leftData: null,
      rightData: null,
      historyDialogVisible: false
    };
  },
  methods: {
    async extractData() {
      // 检查链接是否为空
      if (!this.zangbaoLink1 && !this.zangbaoLink2) {
        ElMessage.error('请至少输入一个藏宝阁链接');
        return;
      }

      // 重置数据
      this.leftData = null;
      this.rightData = null;
      
      // 重置卡片状态为初始状态
      this.resetOpacity();

      // 获取左侧数据
      if (this.zangbaoLink1) {
        try {
          this.leftData = await this.fetchAccountData(this.zangbaoLink1);
        } catch (error) {
          console.error('获取左侧数据失败:', error);
          ElMessage.error('获取左侧数据失败: ' + (error.message || '未知错误'));
        }
      }

      // 获取右侧数据
      if (this.zangbaoLink2) {
        try {
          this.rightData = await this.fetchAccountData(this.zangbaoLink2);
        } catch (error) {
          console.error('获取右侧数据失败:', error);
          ElMessage.error('获取右侧数据失败: ' + (error.message || '未知错误'));
        }
      }

      // 更新卡片透明度
      this.$nextTick(() => {
        this.updateCardOpacity();
      });
    },

    async fetchAccountData(link) {
      // 去除链接中?后面的部分
      const cleanLink = link.split('?')[0];
      
      // 使用正则表达式提取ID
      const regex = /\/equip\/1\/([a-zA-Z0-9\-]+)/;
      const match = cleanLink.match(regex);

      if (!match || !match[1]) {
        throw new Error('未找到有效的ID');
      }

      const extractedId = match[1];
      const ordersn = extractedId;
      
      const { data, pending, error } = await useFetch('/api/equip/detail', {
        params: { ordersn }
      });

      if (!data.value) {
        throw new Error('获取装备信息失败');
      }

      const equip = data.value;
      
      // 构建API URL
      const apiUrl = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;

      // 获取JSON数据
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 获取响应文本
      const textData = await response.text();
      const parsedData = JSON.parse(textData); 

      const decodedData = parsedData.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
      });
      const accountData = JSON.parse(decodedData);

      // 筛选 quality 为 5 的数据
      const quality5Cards = accountData.card.filter(card => card.quality === 5);

      // 根据 icon_hero_id 去重，保留 advance_num 最大的记录
      const uniqueCards = quality5Cards.reduce((acc, card) => {
        // 使用 icon_hero_id 作为唯一标识
        const existingCard = acc.find(c => c.hero_id === card.hero_id && c.season === card.season);
        
        if (existingCard) {
          // 如果已存在相同 icon_hero_id 的卡片，比较 advance_num 并保留较大的
          if (card.advance_num > existingCard.advance_num) {
            existingCard.advance_num = card.advance_num;
            // 同时更新其他可能变化的属性
            existingCard.name = card.name;
            existingCard.country = card.country;
            existingCard.awake_state = card.awake_state;
            existingCard.policy_awake_state = card.policy_awake_state;
            existingCard.hero_achieve = card.hero_achieve;
            existingCard.is_support = card.is_support;
            existingCard.season = card.season;
            existingCard.icon_hero_id = card.icon_hero_id;
          }
        } else {
          // 如果不存在，则添加新卡片
          acc.push(card);
        }
        return acc;
      }, []);

      // 处理武器数据
      const phase3Weapons = accountData.gear?.filter(weapon => weapon.phase === 3) || [];
      const redWeapons = phase3Weapons.filter(weapon => weapon.advance === 1);
      const pinkWeapons = phase3Weapons.filter(weapon => weapon.level_type === 2 && weapon.advance !== 1);
      const blueWeapons = phase3Weapons.filter(weapon => weapon.level_type === 0 && weapon.advance !== 1);

      // 处理任期数据
      const tenures = {
        yuan_bao: accountData.tenure?.yuan_bao || 0,
        yue_ka_endtime: accountData.tenure?.yue_ka_endtime || '',
        jiang_ling: accountData.tenure?.jiang_ling || 0,
        bind_yuan_bao: accountData.tenure?.bind_yuan_bao || 0,
        hufu: accountData.tenure?.hufu || 0,
        honor: accountData.tenure?.honor || 0,
        chi_zhu_shan_tie: accountData.material?.chi_zhu_shan_tie?.value || 0,
        xiao_ye_zi_tan: accountData.material?.xiao_ye_zi_tan?.value || 0,
        gear_feature_hammer: accountData.material?.gear_feature_hammer?.value || 0,
        dynamic_icon: accountData.dynamic_icon?.length || 0,
        season_info: accountData.season_info || '',
        server_info: accountData.server_info || '',
        combine_name: accountData.combine_name || '',
        server_id: accountData.server_id || 0,
        platform: accountData.platform || '',
        get_reward_time_limit: accountData.get_reward_time_limit || ''
      };

      // 计算价格
      const equipPrice = equip?.price ? equip.price / 100 : 0;
      const equipPriceShishi = equip?.price ? equip.price * 1.3 / 100 : 0;

      return {
        extractedId,
        accountData,
        uniqueCards,
        equip,
        tenures,
        redWeapons,
        pinkWeapons,
        blueWeapons,
        equipPrice,
        equipPriceShishi
      };
    },

    updateCardOpacity() {
      // 更新左侧卡片透明度
      if (this.leftRefs.categoryCards && this.leftData?.uniqueCards) {
        this.leftRefs.categoryCards.updateCardOpacity(this.leftData.uniqueCards);
      }
      
      if (this.leftRefs.skillCard && this.leftData?.accountData?.skill) {
        this.leftRefs.skillCard.updateSkillOpacity(this.leftData.accountData.skill);
      }

      // 更新右侧卡片透明度
      if (this.rightRefs.categoryCards && this.rightData?.uniqueCards) {
        this.rightRefs.categoryCards.updateCardOpacity(this.rightData.uniqueCards);
      }
      
      if (this.rightRefs.skillCard && this.rightData?.accountData?.skill) {
        this.rightRefs.skillCard.updateSkillOpacity(this.rightData.accountData.skill);
      }
    },

    resetOpacity() {
      // 重置左侧所有卡片透明度
      if (this.leftRefs.categoryCards) {
        this.leftRefs.categoryCards.categories.forEach(category => {
          category.cards.forEach(card => {
            card.opacity = 0.3;
            card.advance_num = 0;
            card.policy_awake_state = 0;
          });
        });
      }
      
      // 重置左侧技能透明度
      if (this.leftRefs.skillCard) {
        this.leftRefs.skillCard.categories.forEach(category => {
          category.skills.forEach(skill => {
            skill.opacity = 0.3;
            skill.research_progress = 100;
          });
        });
      }

      // 重置右侧所有卡片透明度
      if (this.rightRefs.categoryCards) {
        this.rightRefs.categoryCards.categories.forEach(category => {
          category.cards.forEach(card => {
            card.opacity = 0.3;
            card.advance_num = 0;
            card.policy_awake_state = 0;
          });
        });
      }
      
      // 重置右侧技能透明度
      if (this.rightRefs.skillCard) {
        this.rightRefs.skillCard.categories.forEach(category => {
          category.skills.forEach(skill => {
            skill.opacity = 0.3;
            skill.research_progress = 100;
          });
        });
      }
    },

    handleShare() {
      // 显示历史记录弹窗
      this.historyDialogVisible = true;
    }
  }
};
</script>

<style scoped>
.zangbao-page {
  padding: 16px;
}

.link-section {
  margin-bottom: 20px;
}

.link-compare-container {
  display: flex;
  gap: 20px;
}

.link-input {
  flex: 1;
}

.link-input label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.link-input textarea {
  width: 100%;
  height: 100px;
  resize: vertical;
}

.button-section {
  margin: 16px 0;
  text-align: center;
}

.compare-results {
  margin-top: 20px;
}

.compare-container {
  display: flex;
  gap: 20px;
}

.compare-panel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  background-color: #f5f5f5;
  padding: 10px 16px;
  border-bottom: 1px solid #ddd;
}

.panel-content {
  padding: 16px;
}

.season-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.season-item {
  padding: 2px 0;
}

.tabs-assort {
  margin-top: 20px;
}

.other-resources li {
  list-style: none;
}

.dynamic-icon-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dynamic-icon-item {
  text-align: center;
  width: 100px;
}

.dynamic-icon-image {
  width: 100px;
  height: auto;
}

.card-name {
  font-size: 12px;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weapons-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.weapon-group h3 {
  margin-bottom: 10px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.weapons-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .link-compare-container {
    flex-direction: column;
  }
  
  .compare-container {
    flex-direction: column;
  }
}
</style>