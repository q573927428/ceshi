<template>
  <div class="zangbao-page">
    <!-- 页面标题 -->
    <!-- <el-page-header title="藏宝阁链接" /> -->

    <!-- 链接区域 -->
    <div class="link-section">
      <h3>藏宝阁链接对比:</h3>
      <div class="link-input-container">
        <div class="link-input">
          <el-input
            v-model="newLink"
            placeholder="请输入藏宝阁链接，例如：https://stzb.cbg.163.com/cgi/mweb/equip/..."
            maxlength="2000"
            show-word-limit
            @keyup.enter="addLink"
          />
        </div>
        <div class="button-section">
          <el-button type="primary" @click="addLink">添加链接</el-button>
          <!-- <el-button type="success" @click="extractData">一键对比</el-button> -->
          <el-button type="warning" @click="clearLinks">清空链接</el-button>
          <!-- <el-button type="info" @click="handleShare">历史记录</el-button> -->
        </div>
      </div>
    </div>

    <!-- 对比结果区域 -->
    <div class="compare-results" v-if="zangbaoLinks.length > 0">
      <div class="compare-container">
        <div 
          v-for="(link, index) in displayedLinks" 
          :key="index + (currentPage - 1) * pageSize" 
          class="compare-panel"
        >
          <div class="panel-header" v-if="accountDataList[index + (currentPage - 1) * pageSize] && accountDataList[index + (currentPage - 1) * pageSize].accountData && accountDataList[index + (currentPage - 1) * pageSize].equip">
            <div class="header-info">
              <h3>{{ index + (currentPage - 1) * pageSize + 1 }}：{{ accountDataList[index + (currentPage - 1) * pageSize].equip.status_desc }}  {{ accountDataList[index + (currentPage - 1) * pageSize].equip.area_name }}  {{ accountDataList[index + (currentPage - 1) * pageSize].equip.server_name }} （{{ accountDataList[index + (currentPage - 1) * pageSize].equipPrice }}）</h3>
              <div class="price-info">
                ID：{{ accountDataList[index + (currentPage - 1) * pageSize].extractedId }}
              </div>
            </div>
            <el-button 
              type="danger" 
              size="small" 
              @click="removeLink(index + (currentPage - 1) * pageSize)"
            >
              删除
            </el-button>
          </div>
          <div class="panel-content">
            <el-tabs v-model="activeTabs[index + (currentPage - 1) * pageSize]" class="tabs-assort" v-if="accountDataList[index + (currentPage - 1) * pageSize]">
              <el-tab-pane label="武将" name="first">
                <CategoryCardsList :ref="el => setRef('categoryCards', index + (currentPage - 1) * pageSize, el)" />
              </el-tab-pane>
              <el-tab-pane label="技能" name="second">
                <SkillCard :ref="el => setRef('skillCard', index + (currentPage - 1) * pageSize, el)" />
              </el-tab-pane>
              <el-tab-pane label="武器" name="third">
                <div v-if="accountDataList[index + (currentPage - 1) * pageSize].accountData && accountDataList[index + (currentPage - 1) * pageSize].accountData.gear" class="weapons-container">
                  <div class="weapon-group" v-if="accountDataList[index + (currentPage - 1) * pageSize].redWeapons.length > 0">
                    <h3>红武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in accountDataList[index + (currentPage - 1) * pageSize].redWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="accountDataList[index + (currentPage - 1) * pageSize].pinkWeapons.length > 0">
                    <h3>粉武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in accountDataList[index + (currentPage - 1) * pageSize].pinkWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                  
                  <div class="weapon-group" v-if="accountDataList[index + (currentPage - 1) * pageSize].blueWeapons.length > 0">
                    <h3>蓝武</h3>
                    <div class="weapons-list">
                      <WeaponCard 
                        v-for="weapon in accountDataList[index + (currentPage - 1) * pageSize].blueWeapons" 
                        :key="weapon.gear_id"
                        :card="weapon"
                      />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="阵容" name="fourth">
                <FormationComponent 
                  v-if="accountDataList[index + (currentPage - 1) * pageSize].uniqueCards && accountDataList[index + (currentPage - 1) * pageSize].uniqueCards.length > 0" 
                  :uniqueCards="accountDataList[index + (currentPage - 1) * pageSize].uniqueCards" 
                  :single-column="true"
                />
              </el-tab-pane>
              <el-tab-pane label="其他" name="fifth">
                <div class="other-resources">
                  <ul>
                    <li>虎符：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.hufu }}</li>
                    <li>普通玉符：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.bind_yuan_bao }}</li>
                    <li>四通玉符：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.yuan_bao }}</li>
                    <li>将令：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.jiang_ling }}</li>
                    <li>荣誉：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.honor }}</li>
                    <li>赤珠山铁：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.chi_zhu_shan_tie }}个</li>
                    <li>小叶紫檀：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.xiao_ye_zi_tan }}个</li>
                    <li>天工锤：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.gear_feature_hammer }}个</li>
                    <li>皮肤：{{ accountDataList[index + (currentPage - 1) * pageSize].tenures.dynamic_icon }}个</li>
                  </ul>
                </div>
                <div class="dynamic_icon">
                  <div v-if="accountDataList[index + (currentPage - 1) * pageSize].accountData && accountDataList[index + (currentPage - 1) * pageSize].accountData.dynamic_icon" class="dynamic-icon-container">
                    <div 
                      v-for="card in accountDataList[index + (currentPage - 1) * pageSize].accountData.dynamic_icon"
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
      
      <!-- 分页组件 -->
      <div class="pagination-container" v-if="zangbaoLinks.length > pageSize">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="zangbaoLinks.length"
          layout="prev, pager, next, jumper"
          background
        />
      </div>
    </div>

  </div>
</template>

<script>
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponCard from '~/components/WeaponCard.vue';
import FormationComponent from '~/components/FormationComponent.vue';

export default {
  components: {
    CategoryCardsList,
    SkillCard,
    WeaponCard,
    FormationComponent
  },
  data() {
    return {
      newLink: '',
      zangbaoLinks: [],
      activeTabs: [],
      refs: {
        categoryCards: {},
        skillCard: {}
      },
      accountDataList: [],
      historyDialogVisible: false,
      currentPage: 1,
      pageSize: 6
    };
  },
  computed: {
    displayedLinks() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.zangbaoLinks.slice(startIndex, endIndex);
    }
  },
  mounted() {
    // 页面加载时从本地存储恢复数据
    this.loadFromLocalStorage();
  },
  methods: {
    addLink() {
      if (!this.newLink.trim()) {
        ElMessage.warning('请输入藏宝阁链接');
        return;
      }
      
      // 检查链接是否已经存在
      if (this.zangbaoLinks.includes(this.newLink)) {
        ElMessage.warning('该链接已存在');
        return;
      }
      
      const linkIndex = this.zangbaoLinks.length;
      this.zangbaoLinks.push(this.newLink);
      
      // 添加链接后立即获取数据
      this.fetchAndDisplayData(this.newLink, linkIndex);
      
      this.newLink = '';
      ElMessage.success('链接添加成功');
    },
    
    removeLink(index) {
      this.zangbaoLinks.splice(index, 1);
      this.accountDataList.splice(index, 1);
      this.activeTabs.splice(index, 1);
      
      // 如果当前页没有数据了，回到上一页
      if (this.displayedLinks.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
      
      // 同时更新本地存储
      this.saveToLocalStorage();
      
      // 从缓存中移除对应的数据
      if (typeof window !== 'undefined') {
        try {
          const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
          const linkKeys = Object.keys(cache);
          // 删除索引对应的链接的缓存数据
          if (index < linkKeys.length) {
            const linkToRemove = linkKeys[index];
            delete cache[linkToRemove];
            localStorage.setItem('zangbaoCache', JSON.stringify(cache));
          }
        } catch (e) {
          console.error('删除缓存数据失败:', e);
        }
      }
    },
    
    clearLinks() {
      this.zangbaoLinks = [];
      this.accountDataList = [];
      this.activeTabs = [];
      this.currentPage = 1;
      
      // 清除本地存储的数据
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zangbaoLinks');
          localStorage.removeItem('zangbaoCache');
        } catch (e) {
          console.error('清除本地存储失败:', e);
        }
      }
      
      ElMessage.info('链接已清空');
    },

    setRef(type, index, el) {
      if (!this.refs[type]) {
        this.refs[type] = {};
      }
      this.refs[type][index] = el;
    },

    async fetchAndDisplayData(link, index) {
      try {
        // 初始化tab
        if (index >= this.activeTabs.length) {
          // Vue 3中不需要使用$set，直接push即可
          this.activeTabs.push('first');
        } else {
          this.activeTabs.splice(index, 1, 'first');
        }
        
        const data = await this.fetchAccountData(link);
        
        // 确保accountDataList数组长度足够
        while (this.accountDataList.length <= index) {
          this.accountDataList.push(null);
        }
        
        // 使用splice确保响应性
        this.accountDataList.splice(index, 1, data);
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 更新卡片透明度
        this.$nextTick(() => {
          this.updateSingleCardOpacity(index, data);
        });
      } catch (error) {
        console.error(`获取链接数据失败:`, error);
        ElMessage.error(`获取链接数据失败: ${error.message || '未知错误'}`);
        
        // 即使失败也确保数组长度正确
        while (this.accountDataList.length <= index) {
          this.accountDataList.push(null);
        }
        
        // 设置空数据占位
        this.accountDataList.splice(index, 1, null);
      }
    },

    async extractData() {
      // 检查链接是否为空
      if (this.zangbaoLinks.length === 0) {
        ElMessage.error('请至少输入一个藏宝阁链接');
        return;
      }

      // 重置数据
      this.accountDataList = [];
      this.activeTabs = [];
      
      // 获取所有链接的数据
      for (let i = 0; i < this.zangbaoLinks.length; i++) {
        await this.fetchAndDisplayData(this.zangbaoLinks[i], i);
      }
    },

    async fetchAccountData(link) {
      // 从本地存储查找数据
      const cachedData = this.getCachedData(link);
      if (cachedData) {
        return cachedData;
      }
      
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

      const result = {
        extractedId,
        accountData,
        uniqueCards,
        equip,
        tenures,
        redWeapons,
        pinkWeapons,
        blueWeapons,
        equipPrice,
        equipPriceShishi,
        link // 保存链接以便缓存使用
      };
      
      // 缓存数据
      this.cacheData(link, result);
      
      return result;
    },
    
    updateCardOpacity() {
      // 更新所有卡片透明度
      this.accountDataList.forEach((data, index) => {
        if (data) {
          const categoryCardRef = this.refs.categoryCards[index];
          const skillCardRef = this.refs.skillCard[index];
          
          if (categoryCardRef && data.uniqueCards) {
            categoryCardRef.updateCardOpacity(data.uniqueCards);
          }
          
          if (skillCardRef && data.accountData?.skill) {
            skillCardRef.updateSkillOpacity(data.accountData.skill);
          }
        }
      });
    },
    
    updateSingleCardOpacity(index, data) {
      // 更新单个卡片透明度
      const categoryCardRef = this.refs.categoryCards[index];
      const skillCardRef = this.refs.skillCard[index];
      
      if (categoryCardRef && data.uniqueCards) {
        categoryCardRef.updateCardOpacity(data.uniqueCards);
      }
      
      if (skillCardRef && data.accountData?.skill) {
        skillCardRef.updateSkillOpacity(data.accountData.skill);
      }
    },

    removeAccountData(index) {
      this.accountDataList.splice(index, 1);
      this.activeTabs.splice(index, 1);
      
      // 同时移除对应的链接
      this.zangbaoLinks.splice(index, 1);
      
      // 保存到本地存储
      this.saveToLocalStorage();
    },

    handleShare() {
      // 显示历史记录弹窗
      this.historyDialogVisible = true;
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // 在下一次DOM更新后更新卡片透明度
      this.$nextTick(() => {
        this.updateCardOpacityForCurrentPage();
      });
    },
    
    handleTabClick(index) {
      // 当切换标签页时，确保更新卡片透明度
      this.$nextTick(() => {
        this.updateSingleCardOpacity(index, this.accountDataList[index]);
      });
    },
    
    updateCardOpacityForCurrentPage() {
      // 为当前页的所有数据更新卡片透明度
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, this.accountDataList.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const data = this.accountDataList[i];
        if (data) {
          this.updateSingleCardOpacity(i, data);
        }
      }
    },
    
    // 缓存数据相关方法
    cacheData(link, data) {
      if (typeof window !== 'undefined') {
        try {
          const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
          cache[link] = {
            data: data,
            timestamp: Date.now()
          };
          localStorage.setItem('zangbaoCache', JSON.stringify(cache));
        } catch (e) {
          console.error('缓存数据失败:', e);
        }
      }
    },
    
    getCachedData(link) {
      if (typeof window !== 'undefined') {
        try {
          const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
          const cachedItem = cache[link];
          
          // 检查缓存是否过期（24小时）
          if (cachedItem && (Date.now() - cachedItem.timestamp) < 24 * 60 * 60 * 1000) {
            return cachedItem.data;
          } else if (cachedItem) {
            // 删除过期缓存
            delete cache[link];
            localStorage.setItem('zangbaoCache', JSON.stringify(cache));
          }
        } catch (e) {
          console.error('读取缓存数据失败:', e);
        }
      }
      return null;
    },
    
    // 本地存储相关方法
    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zangbaoLinks', JSON.stringify(this.zangbaoLinks));
        } catch (e) {
          console.error('保存链接到本地存储失败:', e);
        }
      }
    },
    
    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          const savedLinks = localStorage.getItem('zangbaoLinks');
          if (savedLinks) {
            this.zangbaoLinks = JSON.parse(savedLinks);
          }
          
          // 读取缓存数据
          const savedCache = localStorage.getItem('zangbaoCache');
          if (savedCache) {
            const cache = JSON.parse(savedCache);
            // 从缓存中恢复数据到accountDataList
            if (this.zangbaoLinks && this.zangbaoLinks.length > 0) {
              // 初始化activeTabs数组
              this.activeTabs = Array(this.zangbaoLinks.length).fill('first');
              
              // 为每个链接恢复缓存的数据
              this.zangbaoLinks.forEach(async (link, index) => {
                if (cache[link] && cache[link].data) {
                  // 确保accountDataList数组长度足够
                  while (this.accountDataList.length <= index) {
                    this.accountDataList.push(null);
                  }
                  
                  // 使用splice确保响应性
                  this.accountDataList.splice(index, 1, cache[link].data);
                  
                  // 更新卡片透明度
                  this.$nextTick(() => {
                    this.updateSingleCardOpacity(index, cache[link].data);
                  });
                }
              });
            }
          }
          
        } catch (e) {
          console.error('从本地存储加载链接失败:', e);
        }
      }
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

.link-input-container {
  margin-bottom: 20px;
}

.link-input {
  margin-bottom: 10px;
}

.links-list {
  margin-top: 20px;
}

.link-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.link-index {
  font-weight: bold;
  padding-top: 5px;
  min-width: 60px;
}

.button-section {
  margin: 16px 0;
  text-align: center;
}

.compare-results {
  margin-top: 20px;
}

.compare-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (min-width: 768px) {
  .compare-container {
    grid-template-columns: 1fr 1fr;
  }
}

.compare-panel {
  min-width: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 10px 16px;
  border-bottom: 1px solid #ddd;
}

.header-info {
  flex: 1;
}

.header-info h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.price-info {
  font-size: 12px;
  color: #666;
}

.panel-content {
  margin-top: -20px;
  padding: 0 10px;
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

.loading-placeholder, .empty-placeholder {
  text-align: center;
  padding: 20px;
  color: #999;
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

/* 强制武将卡使用移动端尺寸 */
:deep(.wujiang-item) {
  width: 66px;
  margin: 1px auto;
}

:deep(.wujiang-item .wrap) {
  width: 66px;
  height: 100px;
}

:deep(.wujiang-item .state-wrap) {
  width: 14px;
  height: 14px;
  line-height: 14px;
}

:deep(.wujiang-item .state1),
:deep(.wujiang-item .state2),
:deep(.wujiang-item .state3),
:deep(.wujiang-item .state4),
:deep(.wujiang-item .state5),
:deep(.wujiang-item .state6) {
  background-size: 15px 15px;
}

:deep(.wujiang-item .season-wrap) {
  width: 16px;
  height: 16px;
}

:deep(.wujiang-item .season-N),
:deep(.wujiang-item .season-S2),
:deep(.wujiang-item .season-S3),
:deep(.wujiang-item .season-XP),
:deep(.wujiang-item .season-SP) {
  background-size: 16px 16px;
}

:deep(.wujiang-item .hero-achieve) {
  width: 16px;
  height: 16px;
}

:deep(.wujiang-item .ji-badge) {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
}

:deep(.wujiang-item .ji-10),
:deep(.wujiang-item .ji-11) {
  background-size: 16px 16px;
}

:deep(.wujiang-item .stars) {
  bottom: -2px;
}

:deep(.wujiang-item .star) {
  width: 8px;
  height: 8px;
  margin: 0 0.5px;
}

:deep(.wujiang-item .name) {
  top: 20px;
  left: 2px;
  width: 10px;
  height: 14px;
  font-size: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}
</style>