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
        <div class="link-input" v-if="showRemarkInput">
          <el-input
            v-model="newLinkRemark"
            placeholder="请输入备注，例如：1.5.0"
            maxlength="2000"
          />
        </div>

        <div class="button-section">
          <el-button type="primary" @click="addLink" :loading = "globalLoading">添加链接</el-button>
          <el-button type="warning" @click="updateAll" :loading = "globalLoading">更新全部</el-button>
          <el-button type="info" @click="clearLinks">清空链接</el-button>
          <el-checkbox v-model="showRemarkInput">加备注</el-checkbox>
        </div>
      </div>

      <el-alert
        v-if="updateProgress"
        type="info"
        :closable="false"
        show-icon
        style="margin-top:10px;"
      >
        {{ updateProgress }}
      </el-alert>

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

    <!-- 对比区域 -->
    <div class="compare-results">
      <div v-if="pagedLinks.length > 0">
        <div class="compare-container" :style="gridStyle">
          <div
            v-for="(item) in pagedLinks"
            :key="item.link"
            class="compare-panel"
          >
            <div v-loading = "item.loading">
              <!-- panel header -->
              <div class="panel-header">
                <div class="header-info" v-if="item.data?.equip">
                  <h3>
                    <span>¥{{ item.data.equipPrice }}</span>
                    {{ item.data.equip.status_desc }} -
                    {{ item.data.equip.area_name }} {{ item.data.equip.server_name }}
                  </h3>

                  <div class="price-info">
                    <span class="timestamp-text">时间：{{ formatTimestamp(item.timestamp) }}</span>
                    <span class="id-text">
                      ID：{{ item.data.extractedId }}
                    </span>
                    <span class="remark-bz" v-if="item.remark">备注：{{ item.remark || "" }}</span>
                  </div>

                  <div class="price-info">
                    <el-tag type="primary" effect="plain">卡池 {{ item.data.cardTotalValue || 0 }} 元</el-tag> + <el-tag type="success" effect="plain">武器 {{ item.data.weaponTotalValue || 0 }} 元</el-tag> =
                    <el-tag type="danger" effect="plain"> {{ (item.data.cardTotalValue || 0) + (item.data.weaponTotalValue || 0) }}  元 </el-tag> 
                  </div>
                </div>

                <!-- 操作按钮组 -->
                <div class="header-actions">
                  <div class="header-actions-top">
                    <el-button
                      type="info"
                      circle
                      plain
                      :loading="item.loading"
                      @click="refreshLink(item.link)"
                      title="刷新"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>

                    <el-button type="primary" circle plain @click="copyUrl(item.link)" title="复制链接">
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>

                    <el-button
                      type="warning"
                      circle
                      plain
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
      type="textarea"
      v-model="editDialog.remark"
      placeholder="请输入备注（例如账号适合什么阵容、亮点等）"
      :rows="5"
    />

    <template #footer>
      <el-button @click="editDialog.visible = false">取消</el-button>
      <el-button type="primary" @click="saveRemark">保存</el-button>
    </template>
  </el-dialog>

</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { openDB } from 'idb';
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponList from '~/components/WeaponList.vue';
import FormationComponent from '~/components/FormationComponent.vue';
import { getCardValue, getWeaponValue } from '~/utils/valueCalculator.js';
import { Delete, Star, DocumentCopy, Refresh, Edit, Connection } from '@element-plus/icons-vue';

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
    Edit
  },

  setup() {
    // UI
    const newLink = ref('');
    const zangbaoLinks = ref([]);
    const activeTabs = reactive({});
    const currentPage = ref(1);
    const pageSize = ref(6);
    const filterFavorites = ref(false);
    const sortKey = ref('time');
    const sortOrder = ref('desc');
    const columnMode = ref(2);
    const globalLoading = ref(false);
    const newLinkRemark = ref('');
    const showRemarkInput = ref(true);
    const updateProgress = ref('');


    // IndexedDB
    let dbPromise = null;

    const editDialog = reactive({
      visible: false,
      link: '',
      remark: ''
    });

    onMounted(async () => {
      if (!process.client) return;

      dbPromise = openDB('zangbaoDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('records')) {
            db.createObjectStore('records', { keyPath: 'link' });
          }
        },
      });

      await loadLinksFromDB();
    });
    
    // ========================
    //       IndexedDB 操作
    // ========================

    const saveRecord = async (record) => {
      if (!dbPromise) return;
      const db = await dbPromise;

      // 深拷贝，避免 "could not be cloned" 错误
      const cloned = JSON.parse(JSON.stringify(record));

      await db.put('records', cloned);
    };

    const getRecord = async (link) => {
      if (!dbPromise) return null;
      const db = await dbPromise;
      return await db.get('records', link);
    };

    const deleteRecord = async (link) => {
      if (!dbPromise) return;
      const db = await dbPromise;
      await db.delete('records', link);
    };

    const loadLinksFromDB = async () => {
      if (!dbPromise) return;

      const db = await dbPromise;
      const tx = db.transaction('records', 'readonly');
      const store = tx.objectStore('records');
      const all = await store.getAll();

      zangbaoLinks.value = all.map(r => ({
        link: r.link,
        timestamp: r.timestamp,
        isFavorite: r.isFavorite,
        data: r.data || null,
        loading: false,
        remark: r.remark || '',
      }));

      zangbaoLinks.value.forEach(i => {
        activeTabs[i.link] = 'first';
      });
    };

    // ========================
    // 抓取数据流程（无 cache）
    // ========================

    const extractCbgLink = (text) => {
      const idPattern = /\d{15}-1-[A-Z0-9]{14}/gi;
      const ids = text.match(idPattern);
      if (!ids) return [];
      return ids.map(id => `https://stzb.cbg.163.com/cgi/mweb/equip/1/${id}`);
    };

    const normalizeLink = (link) => {
      try {
        const url = new URL(link);
        return url.origin + url.pathname;
      } catch {
        return link;
      }
    };

    // 主流程：直接抓，不存 cache
    const fetchAccountData = async (link, record = null) => {
      console.log('请求触发 → ', link, new Date().toLocaleTimeString());
      const cleanLink = link.split('?')[0];
      const match = cleanLink.match(/\/equip\/1\/([A-Za-z0-9-]+)/);

      if (!match) throw new Error('无效ID');
      const extractedId = match[1];

      // 1. 获取 equip 详情
      let equip;
  
      if (record === null) {
        // 1. 如果 record 为 null，通过 API 获取 equip 详情
        equip = await $fetch('/api/equip/detail', {
          params: { ordersn: extractedId },
        });
      } else {
        // 2. 如果 record 不为 null，使用 record 中的数据
        equip = {
          price: record?.data?.equip?.price || 0,
          status_desc: record?.data?.equip?.status_desc || '',
          area_name: record?.data?.equip?.area_name || '',
          server_name: record?.data?.equip?.server_name || ''
        };
      }

      // 2. 解析 full.json
      const jsonUrl = `https://cbg-other-desc.res.netease.com/stzb/static/equipdesc/${extractedId}.json`;
      const raw = await fetch(jsonUrl);
      const text = await raw.text();
      const parsed = JSON.parse(text);

      const decoded = parsed.equip_desc.replace(/\\u([0-9a-fA-F]{4})/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16))
      );
      const full = JSON.parse(decoded);

      // 3. 提取数据
      const uniqueCards = extractUniqueCards(full);
      const weapons = extractWeapons(full);

      // 4. 组装 processed
      return buildProcessedData(extractedId, link, equip, full, weapons, uniqueCards);
    };

    // ========================
    // 数据提取
    // ========================
    const extractUniqueCards = (full) => {
      const list = (full.card || []).filter(c => c.quality === 5);
      const result = [];
      list.forEach(c => {
        const ex = result.find(r => r.hero_id === c.hero_id && r.season === c.season);
        if (!ex) result.push({ ...c });
        else if (c.advance_num > ex.advance_num) ex.advance_num = c.advance_num;
      });
      return result;
    };

    const extractWeapons = (full) => {
      const phase3 = (full.gear || []).filter(w => w.phase === 3);

      const red = phase3.filter(w => w.advance === 1).map(w => ({
        ...w,
        color: '红',
        calculatedValue: getWeaponValue(w),
      }));

      const pink = phase3.filter(w => w.level_type === 2 && w.advance !== 1).map(w => ({
        ...w,
        color: '粉',
        calculatedValue: getWeaponValue(w),
      }));

      const blue = phase3.filter(w => w.level_type === 0 && w.advance !== 1).map(w => ({
        ...w,
        color: '蓝',
        calculatedValue: getWeaponValue(w),
      }));

      return { redWeapons: red, pinkWeapons: pink, blueWeapons: blue };
    };

    const buildProcessedData = (extractedId, link, equip, full, weapons, uniqueCards) => {
      const cardTotalValue = uniqueCards.reduce((sum, c) => sum + getCardValue(c), 0);
      const allW = [...weapons.redWeapons, ...weapons.pinkWeapons, ...weapons.blueWeapons];
      allW.forEach(w => w.calculatedValue = getWeaponValue(w));
      const weaponTotalValue = allW.reduce((s, w) => s + w.calculatedValue, 0);

      return {
        extractedId,
        link,
        equipPrice: equip.price / 100,
        equip: {
          price: equip.price,
          status_desc: equip.status_desc,
          area_name: equip.area_name,
          server_name: equip.server_name,
        },
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
        ...weapons,
        cardTotalValue,
        weaponTotalValue,
        tenures: {
          yuan_bao: full.tenure?.yuan_bao || 0,
          bind_yuan_bao: full.tenure?.bind_yuan_bao || 0,
          honor: full.tenure?.honor || 0,
          jiang_ling: full.tenure?.jiang_ling || 0,
          hufu: full.tenure?.hufu || 0,
          chi_zhu_shan_tie: full.material?.chi_zhu_shan_tie?.value || 0,
          xiao_ye_zi_tan: full.material?.xiao_ye_zi_tan?.value || 0,
          gear_feature_hammer: full.material?.gear_feature_hammer?.value || 0,
        },
        dynamic_icon: full.dynamic_icon || [],
      };
    };

    // ========================
    // 添加链接
    // ========================
    const addLink = async () => {
      const input = newLink.value.trim();
      if (!input) {
        ElMessage.warning('请输入链接');
        return;
      }

      const links = extractCbgLink(input);
      if (!links.length) {
        ElMessage.warning('未识别到合法链接');
        return;
      }

      globalLoading.value = true;

      const failed = [];  // 收集失败项

      for (const rawLink of links) {
        const link = normalizeLink(rawLink);

        try {
          let record = await getRecord(link);

          if (record) {
            // 已存在 → 更新
            const processed = await fetchAccountData(link, record);
            record.data = processed;
            record.timestamp = Date.now();
            await saveRecord(record);
          } else {
            // 新增
            const remark = newLinkRemark.value?.trim() || '';
            const newRecord = {
              link,
              timestamp: Date.now(),
              isFavorite: false,
              data: null,
              remark
            };

            await saveRecord(newRecord);

            const processed = await fetchAccountData(link);
            newRecord.data = processed;
            await saveRecord(newRecord);
          }

        } catch (err) {
          console.error("处理失败：", link, err);
          failed.push(link);
          // 继续执行下一个链接，而不是中断整个循环
          continue;
        }
      }

      await loadLinksFromDB();
      globalLoading.value = false;
      newLink.value = "";

      if (failed.length) {
        ElMessage.warning(`部分添加失败：${failed.length} 个`);
      } else {
        ElMessage.success('添加成功');
      }
    };

    // ========================
    // 删除链接
    // ========================
    const removeLink = async (link) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除该链接？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        await deleteRecord(link);
        await loadLinksFromDB();
        ElMessage.success('删除成功');
      } catch (error) {
        // 用户点击取消会进入这里
        ElMessage.info('已取消');
      }
    };
    
    //清空链接
    const clearLinks = async () => {
      try {
        // 使用 await 等待用户确认
        await ElMessageBox.confirm(
          '确定要清空所有链接？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (!dbPromise) return;

        const db = await dbPromise;
        await db.clear('records');

        await loadLinksFromDB();

        ElMessage.success('已清空');
      } catch (error) {
        // 用户点击取消会进入这里
        ElMessage.info('已取消');
      }
    };


    const openLink = (link) => {
      window.open(link, '_blank');
    };

    // ========================
    // 刷新
    // ========================
    const refreshLink = async (link) => {
      const item = pagedLinks.value.find(i => i.link === link);
      if (!item) return;
      item.loading = true;

      try {
        let record = await getRecord(link);
        if (!record) return;
        const processed = await fetchAccountData(link, record);
        record.data = processed;
        // record.timestamp = Date.now();

        await saveRecord(record);
        await loadLinksFromDB();

        ElMessage.success('刷新成功')
      } catch (error) {
        ElMessage.success('刷新失败')
      }finally {
        item.loading = false;
      }
    };


    // ========================
    // 更新全部
    // ========================
    const updateAll = async () => {
      const total = zangbaoLinks.value.length;
      if (total === 0) {
        ElMessage.info('没有链接需要更新');
        return;
      }

      globalLoading.value = true;

      let index = 0;

      for (const item of zangbaoLinks.value) {
        index++;
        updateProgress.value = `正在更新 ${index} / ${total} ...`;

        const record = await getRecord(item.link);
        if (!record) continue;

        try {
          const processed = await fetchAccountData(item.link, record);
          record.data = processed;
          record.timestamp = Date.now();
          await saveRecord(record);
        } catch (err) {
          console.error(err);
        }
      }

      await loadLinksFromDB();
      globalLoading.value = false;

      updateProgress.value = '';
      ElMessage.success('全部更新完成');
    };


    // ========================
    // 收藏
    // ========================
    const toggleFavorite = async (item) => {
      const record = await getRecord(item.link);
      if (!record) return;

      record.isFavorite = !record.isFavorite;
      await saveRecord(record);
      await loadLinksFromDB();
    };
    // 打开编辑对话框
    const editRecord = (item) => {
      editDialog.link = item.link;
      editDialog.remark = item.remark || '';
      editDialog.visible = true;
    };

    // 保存备注
    const saveRemark = async () => {
      if (!dbPromise) return;

      const db = await dbPromise;
      const record = await db.get('records', editDialog.link);

      if (record) {
        record.remark = editDialog.remark || '';
        await db.put('records', JSON.parse(JSON.stringify(record)));
      }

      await loadLinksFromDB();
      editDialog.visible = false;
      ElMessage.success('备注已保存');
    };

    const copyUrl = (cbgLink) => {
      navigator.clipboard.writeText(cbgLink).then(() => {
        ElMessage({ message: '复制成功', type: 'success', zIndex: 99999 });
      }).catch(() => { ElMessage({ message: '复制失败', type: 'error' }); });
    };
    // toggleFilter
    const toggleFilter = () => {
      filterFavorites.value = !filterFavorites.value;
      currentPage.value = 1;
    };

    // setSort
    const setSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
      currentPage.value = 1;
    };

    // ========================
    // 排序 & 分页
    // ========================
    const filteredLinks = computed(() => {
      let list = zangbaoLinks.value;

      if (filterFavorites.value) {
        list = list.filter(i => i.isFavorite);
      }

      const key = sortKey.value;
      const order = sortOrder.value;

      return [...list].sort((a, b) => {
        const A = key === 'price' ? (a.data?.equipPrice || 0) : a.timestamp;
        const B = key === 'price' ? (b.data?.equipPrice || 0) : b.timestamp;
        return order === 'asc' ? A - B : B - A;
      });
    });

    const pagedLinks = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return filteredLinks.value.slice(start, start + pageSize.value);
    });

    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${columnMode.value}, 1fr)`
    }));
    // 翻页
    const handlePageChange = (page) => {
      currentPage.value = page;
      // 翻页后平滑滚动到页面最上面
      nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    };
    const formatTimestamp = (ts) => {
      if (!ts) return '';
      const date = new Date(ts);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return {
      newLink,
      zangbaoLinks,
      activeTabs,
      filteredLinks,
      pagedLinks,
      gridStyle,
      editDialog,

      addLink,
      removeLink,
      clearLinks,
      openLink,
      refreshLink,
      updateAll,
      toggleFavorite,
      toggleFilter,
      setSort,
      copyUrl,
      editRecord,
      saveRemark,
      handlePageChange,
      formatTimestamp,

      currentPage,
      pageSize,
      sortKey,
      sortOrder,
      filterFavorites,
      columnMode,
      globalLoading,
      newLinkRemark,
      showRemarkInput,
      updateProgress,
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
  padding-top: 8px;
}
.header-actions {
  margin-bottom: 8px;
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
.id-text{
  display: inline-block;
  font-size: 12px;
  margin-right: 8px;
  padding-bottom: 3px;
}
.remark-bz{
  margin-right: 8px;
  display: inline-block; 
  padding-bottom: 8px;
  color: #000;
}
.timestamp-text{
  margin-right: 8px;
  display: inline-block; 
  white-space: nowrap; 
  padding-bottom: 3px; 
}
</style>