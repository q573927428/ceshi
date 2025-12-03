<template> 
  <div class="zangbao-page">
    <!-- 链接输入 + 操作 -->
    <div class="link-section">
      <h3>藏宝阁链接:</h3>

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
          <!-- <el-button type="warning" @click="updateAll">更新全部</el-button> -->
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
          <el-button :type="columnMode === 5 ? 'primary' : 'default'" @click="columnMode = 5">5 列</el-button>
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
                  <span>¥{{ item.data.equipPrice }}</span>
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
                  <span v-if="item.remark">备注：{{ item.remark || "" }}</span>
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

                <el-button
                  type="warning"
                  circle
                  plain
                  :loading="item.loading"
                  @click="editRecord(item)"
                  title="编辑"
                >
                  <el-icon><Edit /></el-icon>
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
                        :single-column="columnMode === 3 || columnMode ===4 || columnMode ===5"
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

  <!-- 编辑备注对话框 -->
  <el-dialog
    v-model="editDialog.visible"
    title="编辑备注"
    width="400px"
  >
    <el-input
      v-model="editDialog.remark"
      type="textarea"
      :rows="5"
      placeholder="请输入备注，例如亮点、阵容特点等"
    />

    <template #footer>
      <el-button @click="editDialog.visible = false">取消</el-button>
      <el-button type="primary" @click="saveRemark">保存</el-button>
    </template>
  </el-dialog>
</template>

<script>
/**
 * zangbaoLinks 统一存储缓存数据
 * 不再使用 zangbaoCache
 */

import { ref, reactive, computed, watch, onMounted } from 'vue';
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponList from '~/components/WeaponList.vue';
import FormationComponent from '~/components/FormationComponent.vue';
import CardWeaponValue from '~/components/CardWeaponValue.vue';
import { getCardValue, getWeaponValue } from '~/utils/valueCalculator.js';
import { Delete, Star, DocumentCopy, Refresh, Edit, Connection } from '@element-plus/icons-vue';

const DEFAULT_CONCURRENCY = 2;

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
    Edit
  },

  setup() {
    const newLink = ref('');
    const zangbaoLinks = ref([]); // 每项 { link, timestamp, isFavorite, data, loading }
    const activeTabs = reactive({});
    const currentPage = ref(1);
    const pageSize = ref(6);
    const filterFavorites = ref(false);
    const sortKey = ref('time');
    const sortOrder = ref('desc');
    const columnMode = ref(2);
    const globalLoading = ref(false);
    const editDialog = reactive({
      visible: false,
      link: '',
      remark: ''
    });

    // ---------- 本地读取/保存 zangbaoLinks ----------
    const saveLinksToLocal = () => {
      try {
        localStorage.setItem('zangbaoLinks', JSON.stringify(zangbaoLinks.value));
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
          remark: i.remark || "", 
        }));
        zangbaoLinks.value.forEach(item => {
          activeTabs[item.link] = 'first';
        });
      } catch (e) {
        console.warn('读取 links 失败', e);
      }
    };

    // ---------- 工具函数 ----------
    const normalizeLink = (link) => {
      try {
        const url = new URL(link);
        return url.origin + url.pathname;
      } catch {
        return link;
      }
    };

    const extractCbgLink = (text) => {
      const match = text.match(/https:\/\/stzb\.cbg\.163\.com\/cgi\/mweb\/equip\/1\/[0-9a-zA-Z\-]+/i);
      return match ? match[0] : null;
    };

    // ---------- fetchAccountData 拆分小函数 ----------
    const fetchEquipDetail = async (extractedId) => {
      const equip = await $fetch('/api/equip/detail', { params: { ordersn: extractedId } });
      return equip;
    };

    const fetchFullJson = async (extractedId) => {
      const url = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;
      const raw = await fetch(url);
      const rawText = await raw.text();
      const parsed = JSON.parse(rawText);
      const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) =>
        String.fromCharCode(parseInt(grp, 16))
      );
      const full = JSON.parse(decoded);
      return full;
    };

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

    const calcCardTotalValue = (uniqueCards) => uniqueCards.reduce((sum, c) => sum + getCardValue(c), 0);

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

      return {
        extractedId,
        link,
        equip: {
          price: equip.price || 0,
          status_desc: equip.status_desc,
          area_name: equip.area_name,
          server_name: equip.server_name,
        },
        equipPrice: equip.price / 100,
        uniqueCards: (uniqueCards || []).map(c => ({
          name: c.name,
          imageUrl: c.imageUrl || '',
          country: c.country,
          quality: c.quality,
          awake_state: c.awake_state,
          policy_awake_state: c.policy_awake_state,
          hero_achieve: c.hero_achieve,
          advance_num: c.advance_num,
          is_support: c.is_support,
          season: c.season,
          hero_id: c.hero_id,
          icon_hero_id: c.icon_hero_id,
          opacity: c.opacity ?? 1
        })),
        skill: (full.skill || []).map(s => ({
          skill_id: s.skill_id,
          name: s.name,
          skill_type: s.skill_type,
          research_progress: s.research_progress
        })),
        redWeapons: weapons.redWeapons || [],
        pinkWeapons: weapons.pinkWeapons || [],
        blueWeapons: weapons.blueWeapons || [],
        cardTotalValue,
        weaponTotalValue,
        tenures,
        dynamic_icon: full.dynamic_icon || [],
      };
    };

    // ---------- 主流程 ----------
    const fetchAccountData = async (link) => {
      console.log('请求触发 → ', link, new Date().toLocaleTimeString());
      const existing = zangbaoLinks.value.find(i => i.link === link);
      if (existing?.data) return existing.data;

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

      if (existing) existing.data = processed;

      saveLinksToLocal();
      return processed;
    };

    // ---------- 链接操作 ----------
    const addLink = async () => {
      if (!newLink.value?.trim()) {
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

      const existing = zangbaoLinks.value.find(i => i.link === normalized);
      if (existing) {
        existing.timestamp = Date.now();
        saveLinksToLocal();
        ElMessage.success('链接已存在，已更新时间');
        newLink.value = '';
        return;
      }

      const item = { 
        link: normalized, 
        timestamp: Date.now(), 
        isFavorite: false, 
        data: null, 
        loading: true, 
        remark: '',
      };
      zangbaoLinks.value.push(item);
      activeTabs[item.link] = 'first';
      saveLinksToLocal();

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

    const removeLink = (link) => {
      ElMessageBox.confirm('确定要删除该链接吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => {
          const idx = zangbaoLinks.value.findIndex(i => i.link === link);
          if (idx !== -1) {
            zangbaoLinks.value.splice(idx, 1);
            delete activeTabs[link];
            saveLinksToLocal();
            ElMessage.success('已删除');
            if (pagedLinks.value.length === 0 && currentPage.value > 1) currentPage.value--;
          }
        }).catch(() => ElMessage.info('已取消'));
    };

    const clearLinks = () => {
      ElMessageBox.confirm('确定要清空所有链接？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => {
          zangbaoLinks.value = [];
          for (const k in activeTabs) delete activeTabs[k];
          try { localStorage.removeItem('zangbaoLinks'); } catch (e) {}
          ElMessage.success('已清空');
        }).catch(() => ElMessage.info('已取消'));
    };

    const toggleFavorite = (item) => {
      item.isFavorite = !item.isFavorite;
      saveLinksToLocal();
      ElMessage.success(item.isFavorite ? '已收藏' : '已取消收藏');
    };

    const copyUrl = (cbgLink) => {
      navigator.clipboard.writeText(cbgLink).then(() => {
        ElMessage({ message: '复制成功', type: 'success', zIndex: 99999 });
      }).catch(() => { ElMessage({ message: '复制失败', type: 'error' }); });
    };

    // 打开编辑备注窗口
    const editRecord = (item) => {
      if (!item || !item.link) {
        ElMessage.error("记录无效，无法编辑备注");
        return;
      }
      editDialog.link = item.link;
      editDialog.remark = item.remark || "";
      editDialog.visible = true;
    };

    // 保存备注
    const saveRemark = () => {
      const link = editDialog.link;
      if (!link) {
        ElMessage.error("保存失败：无效的链接");
        return;
      }

      // 找到记录
      const item = zangbaoLinks.value.find(i => i.link === link);
      if (!item) {
        ElMessage.error("保存失败：记录不存在");
        return;
      }

      // 写入备注
      item.remark = editDialog.remark || "";

      // 保存到 localStorage
      saveLinksToLocal();

      editDialog.visible = false;
      ElMessage.success("备注已保存");
    };

    const openLink = (url) => { window.open(url, "_blank"); };

    const refreshLink = async (link) => {
      const item = zangbaoLinks.value.find(i => i.link === link);
      if (!item) return;
      item.loading = true;
      item.data = null;
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

    const updateAll = async (concurrency = DEFAULT_CONCURRENCY) => {
      if (!zangbaoLinks.value.length) {
        ElMessage.info('没有链接需要更新');
        return;
      }
      globalLoading.value = true;
      const queue = [...zangbaoLinks.value];
      let running = 0;
      const errors = [];

      const runNext = () => {
        if (queue.length === 0) return Promise.resolve();
        if (running >= concurrency) return Promise.resolve();
        const item = queue.shift();
        running++;
        item.loading = true;
        item.data = null;

        return fetchAccountData(item.link)
          .then(processed => {
            item.data = processed;
            item.timestamp = Date.now();
            item.loading = false;
          })
          .catch(err => { item.loading = false; errors.push({ link: item.link, error: err }); })
          .finally(() => { running--; })
          .then(() => runNext());
      };

      const starters = [];
      for (let i = 0; i < concurrency; i++) starters.push(runNext());
      await Promise.all(starters);

      saveLinksToLocal();
      globalLoading.value = false;

      if (errors.length) ElMessage.warning(`部分链接更新失败（${errors.length}）`);
      else ElMessage.success('更新所有数据成功');
    };

    // ---------- 分页、过滤、排序 ----------
    const filteredLinks = computed(() => {
      let list = zangbaoLinks.value;
      if (filterFavorites.value) list = list.filter(item => item.isFavorite);
      const key = sortKey.value || 'time';
      const order = sortOrder.value || 'desc';
      const copy = [...list];
      copy.sort((a, b) => {
        let valA = 0, valB = 0;
        if (key === 'price') { valA = a.data?.equipPrice || 0; valB = b.data?.equipPrice || 0; }
        else if (key === 'time') { valA = a.timestamp || 0; valB = b.timestamp || 0; }
        return order === 'asc' ? valA - valB : valB - valA;
      });
      return copy;
    });

    const pagedLinks = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredLinks.value.slice(start, start + pageSize.value);
    });

    const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${columnMode.value}, 1fr)` }));

    const handlePageChange = (page) => {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setSort = (key) => {
      if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      else { sortKey.value = key; sortOrder.value = 'asc'; }
      currentPage.value = 1;
    };

    const toggleFilter = () => { filterFavorites.value = !filterFavorites.value; currentPage.value = 1; };

    onMounted(() => { loadLinksFromLocal(); });

    return {
      newLink, zangbaoLinks, activeTabs, currentPage, pageSize, filterFavorites, sortKey, sortOrder, columnMode, globalLoading,
      filteredLinks, pagedLinks, gridStyle,editDialog,
      addLink, removeLink, clearLinks, toggleFavorite, copyUrl, openLink, refreshLink, updateAll,
      handlePageChange, setSort, toggleFilter, editRecord, saveRemark,
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
.column-selector{
  margin-left: 15px;
}
.zangbao-page {
  padding: 16px;
  margin-bottom: 80px;
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
  gap: 1px;
  flex-wrap: wrap;
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
  border-radius: 8px;
  background: #fff;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  flex-wrap: wrap; 
}
.header-info h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
}
.header-info h3 span{
  font-size: 20px;
  margin-right: 8px;
  color: #f02929;
}
.price-info {
  font-size: 12px;
  color: #666;
}
.header-actions {
  display: flex;
  gap: 2px;
}
.panel-content {
  padding: 0 12px;
}
.pagination-container {
  margin: 50px;
  display: flex;
  flex-wrap: wrap; /* 屏幕窄时按钮换行 */
  justify-content: center; /* 水平居中按钮组 */
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
