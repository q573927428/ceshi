<template>
  <div class="zangbao-page">

    <!-- 链接输入 + 筛选排序 -->
    <div class="link-section">
      <h3>藏宝阁链接对比:</h3>
      <div class="link-input-container">
        <div class="link-input">
          <el-input
            v-model="newLink"
            type="textarea"
            :rows="6"
            placeholder="请输入藏宝阁链接，例如：https://stzb.cbg.163.com/cgi/mweb/equip/..."
            maxlength="2000"
            show-word-limit
            @keyup.enter="addLink"
          />
        </div>
        <div class="button-section">
          <el-button type="primary" @click="addLink">添加链接</el-button>
          <el-button type="info" @click="clearLinks">清空链接</el-button>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filter-sort">
        <el-button @click="toggleFilter" plain :type="filterFavorites ? 'primary' : 'warning'">
          {{ filterFavorites ? '显示全部' : '仅看收藏' }}
        </el-button>
        <el-button @click="setSort('price')" plain :type="sortKey === 'price' ? 'primary' : 'default'">
          价格排序 {{ sortKey === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>
        <el-button @click="setSort('time')" plain :type="sortKey === 'time' ? 'primary' : 'default'">
          时间排序 {{ sortKey === 'time' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>

        <el-button-group class="column-selector">
          <el-button :type="columnMode === 1 ? 'primary' : 'default'" @click="columnMode = 1">1 列</el-button>
          <el-button :type="columnMode === 2 ? 'primary' : 'default'" @click="columnMode = 2">2 列</el-button>
          <el-button :type="columnMode === 3 ? 'primary' : 'default'" @click="columnMode = 3">3 列</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 可选：没有数据提示 -->
    <div class="compare-results-wrapper" v-show="isLoading">
      数据加载中...
    </div>
    <!-- 对比区域 -->
    <div class="compare-results">
      <div class="compare-results" v-show="displayedList.length > 0">
        <div class="compare-container" :style="gridStyle">
          <div
            v-for="item in displayedList"
            :key="item.globalIndex"
            class="compare-panel"
          >
            <!-- Header -->
            <div class="panel-header" v-if="item.data?.equip">
              <div class="header-info">
                <h3>
                  {{ item.data.equipPrice }} 元：
                  {{ item.data.equip.status_desc }} -
                  {{ item.data.equip.area_name }} {{ item.data.equip.server_name }}
                </h3>
                <div class="price-info">
                  ID：{{ item.data.extractedId }}
                </div>
              </div>

              <!-- 刷新按钮 -->
              <el-button type="Warning" circle plain >
              <el-icon @click="refreshLink(item.data.link, item.globalIndex)"><Refresh /></el-icon>
              </el-button>

              <!-- 跳转按钮 -->
              <el-button type="info" circle plain >
              <el-icon @click="openLink(item.data.link)"><Connection /></el-icon>
              </el-button>

              <!-- 复制按钮 -->
              <el-button type="primary" circle  plain >
              <el-icon @click="copyUrl(item.data.link)">
                <DocumentCopy />
              </el-icon>
              </el-button>

              <!-- 收藏按钮 -->
              <el-button type="warning" circle :plain="!item.linkObj.isFavorite"  @click="toggleFavorite(item.globalIndex)" >
                <el-icon><Star /></el-icon>
              </el-button>

              <!-- 删除 -->
              <el-button  type="danger" circle plain  @click="removeLink(item.globalIndex)" >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <!-- 内容 -->
            <div class="panel-content">
              <el-tabs
                v-model="activeTabs[item.globalIndex]"
                class="tabs-assort"
                v-if="item.data"
              >
                <el-tab-pane label="武将" name="first">
                  <CategoryCardsList :unique-cards="item.data.uniqueCards || []" />
                </el-tab-pane>

                <el-tab-pane label="技能" name="second">
                  <SkillCard :skill-data="item.data.skill || []" />
                </el-tab-pane>

                <el-tab-pane label="武器" name="third">
                  <WeaponList
                    :red-weapons="item.data.redWeapons"
                    :pink-weapons="item.data.pinkWeapons"
                    :blue-weapons="item.data.blueWeapons"
                  />
                </el-tab-pane>

                <el-tab-pane label="阵容" name="fourth">
                  <FormationComponent
                    v-if="item.data.uniqueCards?.length"
                    :uniqueCards="item.data.uniqueCards"
                    :single-column="true"
                  />
                </el-tab-pane>

                <el-tab-pane label="其他" name="fifth">
                  <div class="other-resources">
                    <ul>
                      <li>虎符：{{ item.data.tenures.hufu }}</li>
                      <li>普通玉符：{{ item.data.tenures.bind_yuan_bao }}</li>
                      <li>四通玉符：{{ item.data.tenures.yuan_bao }}</li>
                      <li>将令：{{ item.data.tenures.jiang_ling }}</li>
                      <li>荣誉：{{ item.data.tenures.honor }}</li>
                      <li>赤珠山铁：{{ item.data.tenures.chi_zhu_shan_tie }}个</li>
                      <li>小叶紫檀：{{ item.data.tenures.xiao_ye_zi_tan }}个</li>
                      <li>天工锤：{{ item.data.tenures.gear_feature_hammer }}个</li>
                      <li>皮肤：{{ item.data.dynamic_icon.length }}个</li>
                    </ul>
                  </div>

                  <div class="dynamic_icon">
                    <div class="dynamic-icon-container" v-if="item.data.dynamic_icon">
                      <div
                        v-for="card in item.data.dynamic_icon"
                        :key="card.icon_hero_id"
                        class="dynamic-icon-item"
                      >
                        <img
                          :src="`https://cbg-stzb.res.netease.com/game_res/cards/cut/card_medium_${card.icon_hero_id}.jpg`"
                          :alt="card.name"
                          class="dynamic-icon-image"
                        />
                        <div class="card-name">{{ card.name }}</div>
                      </div>
                    </div>
                  </div>

                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="filteredAndSortedLinks.length > pageSize">
          <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredAndSortedLinks.length"
            layout="prev, pager, next, jumper"
            background
          />
        </div>
      </div>
      <!-- 可选：没有数据提示 -->
      <div v-show="!isLoading && displayedList.length === 0" class="no-data">
        暂无数据
      </div>
    </div>

  </div>
</template>

<script>
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponList from '~/components/WeaponList.vue';
import FormationComponent from '~/components/FormationComponent.vue';
import { Delete, Star, DocumentCopy, Refresh, Connection } from '@element-plus/icons-vue';

export default {
  components: {
    CategoryCardsList,
    SkillCard,
    WeaponList,
    FormationComponent,
    Delete,
    Star,
    DocumentCopy,
    Refresh,
    Connection,
  },

  data() {
    return {
      isLoading: true,
      newLink: '',
      zangbaoLinks: [], // 现在是对象数组 { link, timestamp, isFavorite }
      activeTabs: [],
      accountDataList: [],
      currentPage: 1,
      pageSize: 6,
      filterFavorites: false,
      sortKey: 'time',
      sortOrder: 'desc',
      columnMode: 2,
    };
  },

  computed: {
    /** 先筛选再排序 */
    filteredAndSortedLinks() {
      let list = this.zangbaoLinks;

      if (this.filterFavorites) {
        list = list.filter(item => item.isFavorite);
      }

      // 默认时间降序
      const key = this.sortKey || 'time';
      const order = this.sortKey ? this.sortOrder : 'desc';
      
      if (key) {
        list = [...list].sort((a, b) => {
          let valA, valB;
          if (key === 'price') {
            valA = this.accountDataList[this.zangbaoLinks.indexOf(a)]?.equipPrice || 0;
            valB = this.accountDataList[this.zangbaoLinks.indexOf(b)]?.equipPrice || 0;
          } else if (key === 'time') {
            valA = a.timestamp;
            valB = b.timestamp;
          }
          return order === 'asc' ? valA - valB : valB - valA;
        });
      }

      return list;
    },

    displayedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const pageLinks = this.filteredAndSortedLinks.slice(start, start + this.pageSize);

      // 遍历当前页的链接，如果内存里没有数据，则触发加载
      pageLinks.forEach((linkObj, i) => {
        const globalIndex = this.zangbaoLinks.indexOf(linkObj);
        if (!this.accountDataList[globalIndex]) {
          this.fetchAndDisplayData(linkObj.link, globalIndex);
        }
      });

      // 返回渲染用的对象
      return pageLinks.map((linkObj, i) => {
        const globalIndex = this.zangbaoLinks.indexOf(linkObj);
        return {
          globalIndex,
          linkObj,
          data: this.accountDataList[globalIndex] || null,
        };
      });
    },
    gridStyle() {
      if (this.columnMode === '2') {
        return {}; // 使用 CSS 原生规则
      }
      return {
        gridTemplateColumns: `repeat(${this.columnMode}, 1fr)`
      };
    }
  },

  mounted() {
    this.loadFromLocalStorage();
  },

  methods: {
    normalizeLink(link) {
      try {
        const url = new URL(link);
        return url.origin + url.pathname;
      } catch {
        return link;
      }
    },

    addLink() {
      const rawLink = this.newLink.trim();
      if (!rawLink) return ElMessage.warning('请输入链接');

      const normalized = this.normalizeLink(rawLink);
      // 👉 添加前删除缓存，确保读新数据
      const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
      delete cache[normalized];
      localStorage.setItem('zangbaoCache', JSON.stringify(cache));
      if (this.zangbaoLinks.some(l => l.link === normalized)) {
        return ElMessage.warning('该链接已存在');
      }

      const index = this.zangbaoLinks.length;
      const linkObj = {
        link: normalized,
        timestamp: Date.now(),
        isFavorite: false,
      };
      this.zangbaoLinks.push(linkObj);

      this.fetchAndDisplayData(normalized, index);
      this.newLink = '';
      this.saveToLocalStorage();

      ElMessage.success('链接添加成功');
    },

    removeLink(globalIndex) {
      const item = this.zangbaoLinks[globalIndex];

      ElMessageBox.confirm(
        '确定要删除该链接吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 用户点击确认
        this.zangbaoLinks.splice(globalIndex, 1);
        this.accountDataList.splice(globalIndex, 1);
        this.activeTabs.splice(globalIndex, 1);

        // 2. 删除缓存中的数据  <<—— 新增
        const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
        delete cache[item.link];
        localStorage.setItem('zangbaoCache', JSON.stringify(cache));

        if (this.displayedList.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }

        this.saveToLocalStorage();
        ElMessage.success('已删除');
      }).catch(() => {
        // 用户点击取消
        ElMessage.info('已取消');
      });
    },

    clearLinks() {
      ElMessageBox.confirm('确定要清空所有链接？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.zangbaoLinks = [];
        this.accountDataList = [];
        this.activeTabs = [];
        this.currentPage = 1;

        if (typeof window !== 'undefined') {
          localStorage.removeItem('zangbaoLinks');
          localStorage.removeItem('zangbaoCache');
        }
        ElMessage.success('已清空');
      });
    },

    toggleFavorite(globalIndex) {
      const item = this.zangbaoLinks[globalIndex];
      item.isFavorite = !item.isFavorite;
      this.saveToLocalStorage();
      ElMessage.success(item.isFavorite ? '已收藏' : '已取消收藏');
    },

    toggleFilter() {
      this.filterFavorites = !this.filterFavorites;
      this.currentPage = 1; // 切换后重置分页
    },

    setSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.currentPage = 1;
    },
    copyUrl(cbgLink) {
      navigator.clipboard.writeText(cbgLink)
      ElMessage({
        message: '复制成功',
        type: 'success',
        zIndex: 99999
      })
    },
    openLink(url) {
      window.open(url, "_blank")
    },
    refreshLink(link, globalIndex) {
      // 删除缓存
      const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
      delete cache[link];
      localStorage.setItem('zangbaoCache', JSON.stringify(cache));

      this.fetchAndDisplayData(link, globalIndex)
        .then(() => {
          ElMessage.success("刷新成功");
        })
        .catch(err => {
          ElMessage.error("刷新失败：" + err.message);
        });
    },

    async fetchAndDisplayData(link, index) {
      try {
        if (index >= this.activeTabs.length) this.activeTabs.push('first');
        else this.activeTabs[index] = 'first';

        const processed = await this.fetchAccountData(link);

        while (this.accountDataList.length <= index) this.accountDataList.push(null);
        this.accountDataList.splice(index, 1, processed);

        this.saveToLocalStorage();
      } catch (err) {
        console.error(err);
        ElMessage.error('获取数据失败');
        while (this.accountDataList.length <= index) this.accountDataList.push(null);
        this.accountDataList[index] = null;
      }
    },

    async fetchAccountData(link) {
      const cached = this.getCachedData(link);
      if (cached) return cached;

      const cleanLink = link.split('?')[0];
      const match = cleanLink.match(/\/equip\/1\/([A-Za-z0-9-]+)/);
      if (!match) throw new Error('无效ID');

      const extractedId = match[1];
      const equip = await $fetch('/api/equip/detail', {
        params: { ordersn: extractedId }
      }).catch(e => { throw new Error('接口请求失败'); });

      
      if (!equip) throw new Error('API返回空');
      const url = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;
      const raw = await fetch(url);
      const rawText = await raw.text();
      const parsed = JSON.parse(rawText);
      const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) =>
        String.fromCharCode(parseInt(grp, 16))
      );
      const full = JSON.parse(decoded);

      const quality5 = (full.card || []).filter(c => c.quality === 5);
      const uniqueCards = [];
      quality5.forEach(card => {
        const exists = uniqueCards.find(c => c.hero_id === card.hero_id && c.season === card.season);
        if (!exists) uniqueCards.push({ ...card });
        else if (card.advance_num > exists.advance_num) exists.advance_num = card.advance_num;
      });

      const phase3 = (full.gear || []).filter(w => w.phase === 3);
      const redWeapons = phase3.filter(w => w.advance === 1).map(w => ({ ...w }));
      const pinkWeapons = phase3.filter(w => w.level_type === 2 && w.advance !== 1).map(w => ({ ...w }));
      const blueWeapons = phase3.filter(w => w.level_type === 0 && w.advance !== 1).map(w => ({ ...w }));

      const tenures = {
        yuan_bao: full.tenure?.yuan_bao || 0,
        bind_yuan_bao: full.tenure?.bind_yuan_bao || 0,
        honor: full.tenure?.honor || 0,
        jiang_ling: full.tenure?.jiang_ling || 0,
        hufu: full.tenure?.hufu || 0,
        chi_zhu_shan_tie: full.material?.chi_zhu_shan_tie?.value || 0,
        xiao_ye_zi_tan: full.material?.xiao_ye_zi_tan?.value || 0,
        gear_feature_hammer: full.material?.gear_feature_hammer?.value || 0,
      };

      const processed = {
        extractedId,
        link,
        equip: {
          price: equip.price || 0,
          status_desc: equip.status_desc,
          area_name: equip.area_name,
          server_name: equip.server_name,
        },
        equipPrice: equip.price / 100,
        uniqueCards,
        skill: full.skill || [],
        redWeapons,
        pinkWeapons,
        blueWeapons,
        tenures,
        dynamic_icon: full.dynamic_icon || [],
      };

      this.cacheData(link, processed);
      return processed;
    },

    cacheData(link, processed) {
      if (typeof window === 'undefined') return;
      const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
      cache[link] = { data: processed, timestamp: Date.now() };
      localStorage.setItem('zangbaoCache', JSON.stringify(cache));
    },

    getCachedData(link) {
      if (typeof window === 'undefined') return null;
      const cache = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
      const item = cache[link];
      if (!item) return null;
      if (Date.now() - item.timestamp > 24 * 3600 * 1000) {
        delete cache[link];
        localStorage.setItem('zangbaoCache', JSON.stringify(cache));
        return null;
      }
      return item.data;
    },
    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zangbaoLinks', JSON.stringify(this.zangbaoLinks));
      }
    },
    loadFromLocalStorage() {
      this.isLoading = true;

      if (typeof window !== 'undefined') {
        const savedLinks = localStorage.getItem('zangbaoLinks');
        if (savedLinks) this.zangbaoLinks = JSON.parse(savedLinks);

        // 只初始化 activeTabs
        this.activeTabs = Array(this.zangbaoLinks.length).fill('first');
      }

      this.isLoading = false;
    },

    handlePageChange(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
};
</script>


<style scoped>
.zangbao-page {
  padding: 16px;
}
.compare-results-wrapper{
  width: 100%;
  min-height: 300px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

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
  grid-template-columns: 1fr; /* 默认 1 列 */
  gap: 20px;
  margin-top: 20px;
}

.column-selector {
  margin-left: 10px;
}

@media (min-width: 1200px) {
  .compare-container:not([style*="grid-template-columns"]) {
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}
</style>