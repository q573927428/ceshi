<template>
  <div class="zangbao-page">
    <!-- 链接输入 + 操作 -->
    <div class="link-section">
      <h3>藏宝阁链接对比:</h3>

      <div class="link-input-container">
        <div class="link-input">
          <el-input
            v-model="newLink"
            type="textarea"
            :rows="6"
            placeholder="请输入藏宝阁链接，例如：https://stzb.cbg.163.com/cgi/mweb/equip/1/..."
            maxlength="2000"
            show-word-limit
            @keyup.enter="addLink"
          />
        </div>

        <div class="button-section">
          <el-button type="primary" @click="addLink">添加链接</el-button>
          <el-button type="warning" @click="updateAll">更新全部</el-button>
          <el-button type="info" @click="clearLinks">清空链接</el-button>
        </div>
      </div>

      <!-- 筛选排序与列配置 -->
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
          <el-button :type="columnMode === 4 ? 'primary' : 'default'" @click="columnMode = 4">4 列</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 全局加载指示 -->
    <div class="global-loading" v-if="globalLoading">
      正在批量更新数据...
    </div>

    <!-- 对比区域 -->
    <div class="compare-results">
      <div v-if="pagedLinks.length > 0">
        <div class="compare-container" :style="gridStyle">
          <div
            v-for="(item) in pagedLinks"
            :key="item.link"
            class="compare-panel"
          >
            <!-- panel header -->
            <div class="panel-header">
              <div class="header-info" v-if="item.data?.equip">
                <h3>
                  {{ item.data.equipPrice }} 元：
                  {{ item.data.equip.status_desc }} -
                  {{ item.data.equip.area_name }} {{ item.data.equip.server_name }}
                </h3>

                <div class="price-info">
                  ID：{{ item.data.extractedId }}
                  <el-button type="text" @click="copyUrl(item.link)" title="复制链接">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>

                <div class="price-info">
                  估算：武将卡池 {{ item.data.cardTotalValue || 0 }} + 武器 {{ item.data.weaponTotalValue || 0 }} =
                  共计 {{ (item.data.cardTotalValue || 0) + (item.data.weaponTotalValue || 0) }} 元
                </div>
              </div>

              <!-- 操作按钮组 -->
              <div class="header-actions">
                <el-button
                  type="info"
                  circle
                  :loading="item.loading"
                  @click="refreshLink(item.link)"
                  title="刷新"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>

                <el-button type="primary" circle plain @click="openLink(item.link)" title="打开链接">
                  <el-icon><Connection /></el-icon>
                </el-button>

                <el-button
                  type="warning"
                  circle
                  :plain="!item.isFavorite"
                  @click="toggleFavorite(item)"
                  title="收藏/取消收藏"
                >
                  <el-icon><Star /></el-icon>
                </el-button>

                <el-button type="danger" circle plain @click="removeLink(item.link)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- panel 内容 -->
            <div class="panel-content">
              <!-- 如果正在加载，显示 skeleton -->
              <div v-if="item.loading" class="panel-loading">
                <el-skeleton rows="4" animated />
              </div>

              <!-- 实际数据 -->
              <div v-else-if="item.data">
                <el-tabs v-model="activeTabs[item.link]" lazy class="tabs-assort">
                  <el-tab-pane label="武将" name="first">
                    <!-- 仅在当前 tab 激活时渲染大型组件 -->
                    <div v-if="activeTabs[item.link] === 'first'">
                      <CategoryCardsList :unique-cards="item.data.uniqueCards || []" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="技能" name="second">
                    <div v-if="activeTabs[item.link] === 'second'">
                      <SkillCard :skill-data="item.data.skill || []" />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="武器" name="third">
                    <div v-if="activeTabs[item.link] === 'third'">
                      <WeaponList
                        :red-weapons="item.data.redWeapons || []"
                        :pink-weapons="item.data.pinkWeapons || []"
                        :blue-weapons="item.data.blueWeapons || []"
                      />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="阵容" name="fourth">
                    <div v-if="activeTabs[item.link] === 'fourth'">
                      <FormationComponent
                        v-if="item.data.uniqueCards?.length"
                        :uniqueCards="item.data.uniqueCards"
                        :single-column="true"
                      />
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="其他" name="fifth">
                    <div v-if="activeTabs[item.link] === 'fifth'">
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

                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>

              <div v-else class="no-data">暂无数据</div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="filteredLinks.length > pageSize">
          <el-pagination
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-size="pageSize"
            :pager-count="6"
            :total="filteredLinks.length"
            layout="prev, pager, next"
            background
          />
        </div>
      </div>

      <div v-else class="no-data">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 完整重构版 index.vue
 * 关键点：
 *  - zangbaoLinks 每项结构统一：{ link, timestamp, isFavorite, data, loading }
 *  - 内存缓存 cacheStore，减少过多 JSON.parse/stringify
 *  - updateAll 支持并发限流
 *  - Tabs lazy + 仅在 active 时渲染大型组件
 *  - fetchAccountData 拆分为小函数（便于维护）
 */

import { ref, reactive, computed, watch, onMounted } from 'vue';
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponList from '~/components/WeaponList.vue';
import FormationComponent from '~/components/FormationComponent.vue';
import CardWeaponValue from '~/components/CardWeaponValue.vue';
import { getCardValue, getWeaponValue } from '~/utils/valueCalculator.js';
import { Delete, Star, DocumentCopy, Refresh, Connection } from '@element-plus/icons-vue';

// 全局并发上限
const DEFAULT_CONCURRENCY = 4;

export default {
  components: {
    CategoryCardsList,
    SkillCard,
    WeaponList,
    FormationComponent,
    CardWeaponValue,
    Delete,
    Star,
    DocumentCopy,
    Refresh,
    Connection,
  },

  setup() {
    // UI / 状态
    const newLink = ref('');
    const zangbaoLinks = ref([]); // 每项 { link, timestamp, isFavorite, data|null, loading:false }
    const activeTabs = reactive({}); // 用 link 作为 key，值为 tab 名称
    const currentPage = ref(1);
    const pageSize = ref(6);
    const filterFavorites = ref(false);
    const sortKey = ref('time');
    const sortOrder = ref('desc');
    const columnMode = ref(2);
    const globalLoading = ref(false);

    // 内存 cache，避免频繁 JSON.parse
    let cacheStore = null;
    const ensureCacheLoaded = () => {
      if (!cacheStore) {
        try {
          cacheStore = JSON.parse(localStorage.getItem('zangbaoCache') || '{}');
        } catch {
          cacheStore = {};
        }
      }
      return cacheStore;
    };
    const persistCacheToLocal = () => {
      try {
        localStorage.setItem('zangbaoCache', JSON.stringify(cacheStore || {}));
      } catch (e) {
        // localStorage 写入失败不致命
        console.warn('写入缓存失败', e);
      }
    };

    // ---------- 辅助：本地保存 / 读取 zangbaoLinks ----------
    const saveLinksToLocal = () => {
      try {
        localStorage.setItem('zangbaoLinks', JSON.stringify(zangbaoLinks.value.map(item => {
          // 不把 data 的大对象全部存入，这里保存 data 以便页面重启后直接显示（可选）
          return {
            link: item.link,
            timestamp: item.timestamp,
            isFavorite: item.isFavorite,
            data: item.data || null,
          };
        })));
      } catch (e) {
        console.warn('保存 links 失败', e);
      }
    };

    const loadLinksFromLocal = () => {
      try {
        const raw = localStorage.getItem('zangbaoLinks');
        if (!raw) return;
        const arr = JSON.parse(raw);
        zangbaoLinks.value = arr.map(i => ({
          link: i.link,
          timestamp: i.timestamp || Date.now(),
          isFavorite: !!i.isFavorite,
          data: i.data || null,
          loading: false,
        }));
        // 初始化 activeTabs
        zangbaoLinks.value.forEach(item => {
          activeTabs[item.link] = 'first';
        });
      } catch (e) {
        console.warn('读取 links 失败', e);
      }
    };

    // ---------- 简单工具函数 ----------
    const normalizeLink = (link) => {
      try {
        const url = new URL(link);
        return url.origin + url.pathname;
      } catch {
        return link;
      }
    };

    // 解析并提取藏宝阁链接（更宽松的正则：支持大小写、数字、连字符）
    const extractCbgLink = (text) => {
      const match = text.match(/https:\/\/stzb\.cbg\.163\.com\/cgi\/mweb\/equip\/1\/[0-9a-zA-Z\-]+/i);
      return match ? match[0] : null;
    };

    // ---------- 缓存读写 ----------
    const getCachedData = (link) => {
      const cache = ensureCacheLoaded();
      return cache[link]?.data || null;
    };

    const cacheData = (link, processed) => {
      const cache = ensureCacheLoaded();
      cache[link] = { data: processed, timestamp: Date.now() };
      persistCacheToLocal();
    };

    const deleteCacheForLink = (link) => {
      const cache = ensureCacheLoaded();
      if (cache[link]) {
        delete cache[link];
        persistCacheToLocal();
      }
    };

    // ---------- fetchAccountData 拆分：小函数 ----------

    // 1. 获取 equip detail（后端接口）
    const fetchEquipDetail = async (extractedId) => {
      const equip = await $fetch('/api/equip/detail', {
        params: { ordersn: extractedId },
      });
      return equip;
    };

    // 2. 获取 equipdesc JSON（静态文件）
    const fetchFullJson = async (extractedId) => {
      const url = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;
      const raw = await fetch(url);
      const rawText = await raw.text();
      const parsed = JSON.parse(rawText);
      // decode \uXXXX
      const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) =>
        String.fromCharCode(parseInt(grp, 16))
      );
      const full = JSON.parse(decoded);
      return full;
    };

    // 3. 提取 unique cards（quality 5 且按 hero_id + season 唯一）
    const extractUniqueCards = (full) => {
      const quality5 = (full.card || []).filter(c => c.quality === 5);
      const uniqueCards = [];
      quality5.forEach(card => {
        const exists = uniqueCards.find(c => c.hero_id === card.hero_id && c.season === card.season);
        if (!exists) uniqueCards.push({ ...card });
        else if (card.advance_num > exists.advance_num) exists.advance_num = card.advance_num;
      });
      return uniqueCards;
    };

    // 4. 提取武器并计算价值
    const extractWeapons = (full) => {
      const phase3 = (full.gear || []).filter(w => w.phase === 3);
      const redWeapons = phase3
        .filter(w => w.advance === 1)
        .map(w => {
          const color = '红';
          const value = getWeaponValue({ ...w, color });
          return { ...w, color, calculatedValue: value };
        });
      const pinkWeapons = phase3
        .filter(w => w.level_type === 2 && w.advance !== 1)
        .map(w => {
          const color = '粉';
          const value = getWeaponValue({ ...w, color });
          return { ...w, color, calculatedValue: value };
        });
      const blueWeapons = phase3
        .filter(w => w.level_type === 0 && w.advance !== 1)
        .map(w => {
          const color = '蓝';
          const value = getWeaponValue({ ...w, color });
          return { ...w, color, calculatedValue: value };
        });

      return { redWeapons, pinkWeapons, blueWeapons };
    };

    // 5. 计算卡片价值总和
    const calcCardTotalValue = (uniqueCards) => {
      return uniqueCards.reduce((sum, c) => sum + getCardValue(c), 0);
    };

    // 6. 组装最终 processed 对象
    const buildProcessedData = (extractedId, link, equip, full, weapons, uniqueCards) => {
      const cardTotalValue = calcCardTotalValue(uniqueCards);
      const allWeapons = [...(weapons.redWeapons || []), ...(weapons.pinkWeapons || []), ...(weapons.blueWeapons || [])];
      const weaponTotalValue = allWeapons.reduce((sum, w) => sum + (w.calculatedValue || 0), 0);

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
        redWeapons: weapons.redWeapons || [],
        pinkWeapons: weapons.pinkWeapons || [],
        blueWeapons: weapons.blueWeapons || [],
        cardTotalValue,
        weaponTotalValue,
        tenures,
        dynamic_icon: full.dynamic_icon || [],
      };
      return processed;
    };

    // ---------- 主流程：fetchAccountData ----------
    const fetchAccountData = async (link) => {
      // 1. 先查缓存
      const cached = getCachedData(link);
      if (cached) return cached;

      const cleanLink = link.split('?')[0];
      const match = cleanLink.match(/\/equip\/1\/([A-Za-z0-9-]+)/);
      if (!match) throw new Error('无效ID');

      const extractedId = match[1];
      const equip = await fetchEquipDetail(extractedId).catch(() => { throw new Error('接口请求失败'); });

      if (!equip) throw new Error('API返回空');

      const full = await fetchFullJson(extractedId);

      const uniqueCards = extractUniqueCards(full);
      const weapons = extractWeapons(full);
      const processed = buildProcessedData(extractedId, link, equip, full, weapons, uniqueCards);

      cacheData(link, processed);
      return processed;
    };

    // ---------- 操作：添加 / 删除 / 刷新 / 更新全部 等 ----------

    // 添加链接
    const addLink = async () => {
      if (!newLink.value || !newLink.value.trim()) {
        ElMessage.warning('请输入链接');
        return;
      }
      const raw = newLink.value.trim();
      const match = extractCbgLink(raw);
      if (!match) {
        ElMessage.warning('链接格式不正确');
        return;
      }
      const normalized = normalizeLink(match);

      // 删除缓存，确保获取最新（可选策略）
      deleteCacheForLink(normalized);

      const existing = zangbaoLinks.value.find(i => i.link === normalized);
      if (existing) {
        existing.timestamp = Date.now();
        saveLinksToLocal();
        ElMessage.success('链接已存在，已更新时间');
        newLink.value = '';
        return;
      }

      // push 新项
      const item = {
        link: normalized,
        timestamp: Date.now(),
        isFavorite: false,
        data: null,
        loading: true,
      };
      zangbaoLinks.value.push(item);
      activeTabs[item.link] = 'first';
      saveLinksToLocal();

      // 异步抓取并展示
      try {
        const processed = await fetchAccountData(normalized);
        item.data = processed;
        item.loading = false;
        saveLinksToLocal();
        ElMessage.success('链接添加成功并已获取数据');
      } catch (err) {
        item.loading = false;
        item.data = null;
        ElMessage.error('获取数据失败：' + (err.message || err));
      } finally {
        newLink.value = '';
      }
    };

    // 删除链接（按 link 匹配）
    const removeLink = (link) => {
      ElMessageBox.confirm('确定要删除该链接吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const idx = zangbaoLinks.value.findIndex(i => i.link === link);
        if (idx !== -1) {
          const item = zangbaoLinks.value[idx];
          // 删除缓存
          deleteCacheForLink(item.link);
          zangbaoLinks.value.splice(idx, 1);
          delete activeTabs[link];
          saveLinksToLocal();
          ElMessage.success('已删除');
          // 调整分页
          if (pagedLinks.value.length === 0 && currentPage.value > 1) currentPage.value--;
        }
      }).catch(() => {
        ElMessage.info('已取消');
      });
    };

    // 清空所有
    const clearLinks = () => {
      ElMessageBox.confirm('确定要清空所有链接？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        zangbaoLinks.value = [];
        for (const k in activeTabs) delete activeTabs[k];
        try {
          localStorage.removeItem('zangbaoLinks');
          localStorage.removeItem('zangbaoCache');
          cacheStore = null;
        } catch (e) {}
        ElMessage.success('已清空');
      }).catch(() => {
        ElMessage.info('已取消');
      });
    };

    // 收藏切换（传 item）
    const toggleFavorite = (item) => {
      item.isFavorite = !item.isFavorite;
      saveLinksToLocal();
      ElMessage.success(item.isFavorite ? '已收藏' : '已取消收藏');
    };

    // 复制 URL
    const copyUrl = (cbgLink) => {
      navigator.clipboard.writeText(cbgLink).then(() => {
        ElMessage({ message: '复制成功', type: 'success', zIndex: 99999 });
      }).catch(() => {
        ElMessage({ message: '复制失败', type: 'error' });
      });
    };

    // 打开新窗口
    const openLink = (url) => {
      window.open(url, "_blank");
    };

    // 刷新单条（删除缓存再拉取）
    const refreshLink = async (link) => {
      const item = zangbaoLinks.value.find(i => i.link === link);
      if (!item) return;
      item.loading = true;
      deleteCacheForLink(link);
      try {
        const processed = await fetchAccountData(link);
        item.data = processed;
        item.loading = false;
        saveLinksToLocal();
        ElMessage.success('刷新成功');
      } catch (err) {
        item.loading = false;
        ElMessage.error('刷新失败：' + (err.message || err));
      }
    };

    // updateAll：并发限流版本
    const updateAll = async (concurrency = DEFAULT_CONCURRENCY) => {
      if (!zangbaoLinks.value.length) {
        ElMessage.info('没有链接需要更新');
        return;
      }
      globalLoading.value = true;

      // 先清除所有对应缓存（可选），这里我们选择只删除需要更新的缓存
      // 并行执行，但限制并发
      const queue = [...zangbaoLinks.value];
      let running = 0;
      const errors = [];

      const runNext = () => {
        if (queue.length === 0) return Promise.resolve();
        if (running >= concurrency) return Promise.resolve();
        const item = queue.shift();
        running++;
        item.loading = true;
        // 删除缓存确保拉到最新
        deleteCacheForLink(item.link);

        return fetchAccountData(item.link)
          .then(processed => {
            item.data = processed;
            item.timestamp = Date.now();
            item.loading = false;
          })
          .catch(err => {
            item.loading = false;
            errors.push({ link: item.link, error: err });
          })
          .finally(() => {
            running--;
          })
          .then(() => runNext());
      };

      // 启动 concurrency 个任务
      const starters = [];
      for (let i = 0; i < concurrency; i++) starters.push(runNext());
      await Promise.all(starters);

      // 所有任务完成（或失败）
      saveLinksToLocal();
      globalLoading.value = false;

      if (errors.length) {
        ElMessage.warning(`部分链接更新失败（${errors.length}）`);
      } else {
        ElMessage.success('更新所有数据成功');
      }
    };

    // ---------- 分页、过滤、排序（都是基于 zangbaoLinks.value） ----------
    const filteredLinks = computed(() => {
      let list = zangbaoLinks.value;
      if (filterFavorites.value) {
        list = list.filter(item => item.isFavorite);
      }
      // 排序
      const key = sortKey.value || 'time';
      const order = sortOrder.value || 'desc';
      const copy = [...list];
      copy.sort((a, b) => {
        let valA = 0, valB = 0;
        if (key === 'price') {
          valA = a.data?.equipPrice || 0;
          valB = b.data?.equipPrice || 0;
        } else if (key === 'time') {
          valA = a.timestamp || 0;
          valB = b.timestamp || 0;
        }
        return order === 'asc' ? valA - valB : valB - valA;
      });
      return copy;
    });

    const pagedLinks = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredLinks.value.slice(start, start + pageSize.value);
    });

    const gridStyle = computed(() => {
      return { gridTemplateColumns: `repeat(${columnMode.value}, 1fr)` };
    });

    const handlePageChange = (page) => {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 切换排序
    const setSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
      currentPage.value = 1;
    };

    // 切换收藏过滤
    const toggleFilter = () => {
      filterFavorites.value = !filterFavorites.value;
      currentPage.value = 1;
    };

    // ---------- 页面初始化 ----------
    onMounted(() => {
      loadLinksFromLocal();
      ensureCacheLoaded();
      // 对于页面打开后未加载 data 的项，可以选择预热（按当前页）
      // 这里默认不自动批量加载全部，避免大量请求。如果需要可以调用 updateAll()
    });

    // ---------- 小提示：当某项的 data 是 null 且当前页包含该项时可自动触发加载（节制） ----------
    watch([currentPage, () => filteredLinks.value.length], () => {
      // 自动加载当前页但只加载未有 data 的项，避免在 computed 中触发请求
      const pageLinks = pagedLinks.value;
      pageLinks.forEach(item => {
        if (!item.data && !item.loading) {
          // 触发加载（不阻塞 UI）
          item.loading = true;
          fetchAccountData(item.link)
            .then(processed => {
              item.data = processed;
              item.loading = false;
              saveLinksToLocal();
            })
            .catch(() => {
              item.loading = false;
            });
        }
      });
    });

    // ---------- 返回到模板 ----------
    return {
      // state
      newLink,
      zangbaoLinks,
      activeTabs,
      currentPage,
      pageSize,
      filterFavorites,
      sortKey,
      sortOrder,
      columnMode,
      globalLoading,

      // computed
      filteredLinks,
      pagedLinks,
      gridStyle,

      // methods
      addLink,
      removeLink,
      clearLinks,
      toggleFavorite,
      copyUrl,
      openLink,
      refreshLink,
      updateAll,
      handlePageChange,
      setSort,
      toggleFilter,
    };
  }
};
</script>

<style scoped>
/* 手机端屏幕宽度小于 768px 时隐藏按钮组 */
@media (max-width: 767px) {
  .column-selector {
    display: none;
  }
  .panel-header {
    flex-direction: column;
    align-items: stretch; /* 子元素宽度撑满父容器 */
  }
  .panel-header > div {
    width: 100%;
  }
  .compare-container{
    grid-template-columns: repeat(1, 1fr) !important;
  }
  .pagination-container {
    transform: scale(0.85);
    transform-origin: center;
  }
}

/* 桌面端大于 768px 显示按钮组 */
@media (min-width: 768px) {
  .column-selector {
    display: inline-flex;
  }
}
.zangbao-page {
  padding: 16px;
}
.link-section {
  margin-bottom: 16px;
}
.link-input-container {
  display: flex;
  flex-direction: column;  /* 上下排列 */
  
  gap: 12px;
}
.link-input {
  flex: 1;
}
.button-section {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
  flex-wrap: wrap; /* 屏幕窄时按钮换行 */
  justify-content: center; /* 水平居中按钮组 */
}
.filter-sort {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.compare-results {
  margin-top: 16px;
}
.compare-container {
  display: grid;
  gap: 16px;
}
.compare-panel {
  border: 1px solid #e6e6e6;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.panel-header {
  display: flex;
  justify-content: space-between; /* 左右两边拉开 */
  align-items: center;           /* 垂直居中 */
  gap: 10px;                     /* 间距 */
  flex-wrap: wrap;               /* 小屏幕自动换行 */
}
.header-info h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
}

.price-info {
  font-size: 12px;
  color: #666;
}
.header-actions {
  display: flex;
  gap: 6px;
}
.panel-content {
  margin-top: 12px;
}
.pagination-container {
  margin-top: 16px;
  text-align: center;
}
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.panel-loading {
  padding: 8px 0;
}
.dynamic-icon-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dynamic-icon-item {
  width: 64px;
  text-align: center;
}
.dynamic-icon-image {
  width: 64px;
  height: 92px;
  object-fit: cover;
  border-radius: 4px;
}
.card-name {
  font-size: 12px;
  margin-top: 4px;
}
.global-loading {
  margin-top: 8px;
  color: #f56c6c;
}
</style>
