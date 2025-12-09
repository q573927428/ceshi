<template> 
  <div class="zangbao-page">
    <!-- 链接输入 + 操作 -->
    <div class="link-section">
      <div class="link-input-container">
        <div class="link-input-grid">
          <div class="link-input">
            <p>藏宝阁链接(可多个链接):</p>
            <LineNumberTextarea
              v-model="newLink"
              placeholder="请输入链接 例如：https://stzb.cbg.163.com/***"
              :maxlength="25000"
              show-word-limit
            />
          </div>
          <div class="link-input" v-if="showRemarkInput">
            <p>备注(一个链接对应一个备注):</p>
            <LineNumberTextarea
              class="remark-input"
              v-model="newLinkRemark"
              placeholder="请输入备注 例如：试师5200出，四皇，同心队"
              :maxlength="25000"
              show-word-limit
            />
          </div>

          <div class="link-input" v-if="showPriceInput">
            <p>价格(一个链接对应一个价格):</p>
            <LineNumberTextarea
              class="remark-input"
              v-model="newLinkPrice"
              placeholder="请输入价格 例如：23000"
              :maxlength="25000"
              show-word-limit
            />
          </div>
        </div>
        <div class="button-section">
          <el-button type="primary" @click="addLink" :loading = "globalLoading">添加链接</el-button>
          <el-button type="warning" @click="updateAll" :loading = "globalLoading" plain>更新全部</el-button>
          <el-button type="info" @click="clearLinks" plain>清空链接</el-button>
          <el-button type="primary" @click="exportDB" plain>导出数据</el-button>
          <el-upload
            :show-file-list="false"
            accept=".json"
            :before-upload="importDB"
          >
            <el-button type="warning" plain>导入数据</el-button>
          </el-upload>
          <el-checkbox v-model="showRemarkInput">写备注</el-checkbox>
          <el-checkbox v-model="showPriceInput">写价格</el-checkbox>
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
        <span style="margin-top: 3px;">排序：</span>
        <el-button @click="setSort('time')" plain :type="sortKey === 'time' ? 'danger' : 'primary'">
          时间 {{ sortKey === 'time' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>
        <el-button @click="setSort('estimatedPrice')" plain :type="sortKey === 'estimatedPrice' ? 'danger' : 'primary'">
          预估价值 {{ sortKey === 'estimatedPrice' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>
        <el-button @click="setSort('price')" plain :type="sortKey === 'price' ? 'danger' : 'primary'">
          藏宝阁价格 {{ sortKey === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>

        <el-button @click="setSort('ratio')" plain :type="sortKey === 'ratio' ? 'danger' : 'primary'">
          溢价比率 {{ sortKey === 'ratio' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </el-button>

        <el-button-group class="column-selector">
          <el-button :type="columnMode === 1 ? 'primary' : 'default'" @click="columnMode = 1">1 列</el-button>
          <el-button :type="columnMode === 2 ? 'primary' : 'default'" @click="columnMode = 2">2 列</el-button>
          <el-button :type="columnMode === 3 ? 'primary' : 'default'" @click="columnMode = 3">3 列</el-button>
          <el-button :type="columnMode === 4 ? 'primary' : 'default'" @click="columnMode = 4">4 列</el-button>
          <el-button :type="columnMode === 5 ? 'primary' : 'default'" @click="columnMode = 5">5 列</el-button>
        </el-button-group>
      </div>

      <!-- 价格区间筛选 -->
      <div class="price-filter">
        <span style="margin-bottom: 12px;">筛选：</span>
        <el-select v-model="priceFilterType" placeholder="选择筛选字段" class="select-filter">
          <el-option label="藏宝阁价格" value="equipPrice" ></el-option>
          <el-option label="预估价值" value="estimatedPrice"></el-option>
        </el-select>
        <span class="price-filter-input">
          <el-input
            v-model="minPriceInput"
            placeholder="最低价"
            class="price-input"
          />
          <span style="margin-right: 3px; margin-bottom: 10px;">~</span>
          <el-input
            v-model="maxPriceInput"
            placeholder="最高价"
            class="price-input"
          />
          <el-button type="primary" @click="applyPriceFilter" style="margin-bottom: 10px;">筛选</el-button>
          <el-button type="info" @click="clearPriceFilter" style="margin-right: 5px;margin-bottom: 10px;">重置</el-button>
        </span>
        <span class="filter-interval"> | </span>

        <el-select v-model="statusFilter" placeholder="状态筛选" @change="setStatusFilter" class="select-filter">
          <el-option label="全部" value=""></el-option>
          <el-option label="上架中" value="上架中"></el-option>
          <el-option label="未上架" value="未上架"></el-option>
          <el-option label="买家取走" value="买家取走"></el-option>
          <el-option label="卖家取回" value="卖家取回"></el-option>
        </el-select>
        <span class="filter-interval"> | </span>

        <el-button @click="toggleFilter" plain :type="filterFavorites ? 'primary' : 'warning'" style="margin-bottom: 10px;">
          {{ filterFavorites ? '显示全部' : '仅看收藏' }}
        </el-button>
        <span class="filter-interval"> | </span>

        <el-button @click="deleteFilteredResults" type="danger" style="margin-bottom: 10px;" v-if="filteredLinks.length < zangbaoLinks.length">
          删除筛选结果 {{ filteredLinks.length }} 条
        </el-button>
        <el-button plain text style="margin-bottom: 10px;">
          总共 {{ filteredLinks.length }} 条数据
        </el-button>
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
              <div class="panel-header" :class="{ 'bg-red': item.equipPrice > 0 && item.estimatedPrice / item.equipPrice > 1 }">
                <div class="header-info" v-if="item.data?.equip">
                  <h3 class="equip-header">
                    <span class="price-main">¥{{ item.equipPrice }}</span>

                    <span class="price-estimated">
                      (估 ¥{{ item.estimatedPrice }}
                      <span class="separator">|</span>
                      <span
                        class="price-percent"
                        :class="{ up: item.estimatedPrice / item.equipPrice >= 1, down: item.estimatedPrice / item.equipPrice < 1 }"
                      >
                      溢价率 {{
                          item.equipPrice > 0
                            ? ((item.estimatedPrice / item.equipPrice) * 100).toFixed(1) + '%'
                            : '0%'
                        }}
                      </span>
                      )
                    </span>

                    <span class="equip-status">
                      {{ item.data.equip.status_desc }} -
                      {{ item.data.equip.area_name }} 
                      <!-- {{ item.data.equip.server_name }} -->
                    </span>
                  </h3>
                  
                  <div class="price-info">
                    <span class="timestamp-text"><b>时间：</b>{{ formatTimestamp(item.timestamp) }}</span>
                    <span class="id-text">
                      <b>ID：</b>{{ item.data.extractedId }}
                    </span>
                  </div>

                  <div class="price-info">
                    <span class="remark-bz"><b>备注：</b>{{ item.remark || "无" }}</span>
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

                    <el-button type="primary" circle plain @click="copyUrl(item.link,item.remark)" title="复制链接">
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

                    <el-button type="primary" circle plain @click="copyUrl(item.link,item.remark)" title="分享链接">
                      <el-icon><Share /></el-icon>
                    </el-button>

                    <el-button type="danger" circle plain @click="removeLink(item.link)" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="price-info">
                    <el-tag type="primary" size="large" effect="plain" round>卡池 {{ item.data.cardTotalValue || 0 }} 元</el-tag> + <el-tag type="success" effect="plain" size="large" round>武器 {{ item.data.weaponTotalValue || 0 }} 元</el-tag> =
                    <el-tag type="danger" size="large" effect="plain" round> {{ (item.data.cardTotalValue || 0) + (item.data.weaponTotalValue || 0) }}  元 </el-tag> 
                  </div>
                </div>
              </div>

              <!-- panel 内容 -->
              <div class="panel-content">
                <!-- 如果正在加载，显示 skeleton -->
                <div v-if="item.loading" class="panel-loading">
                  <el-skeleton :rows="4" animated />
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
                            <li>皮肤：{{ item.data.dynamic_icon }}个</li>
                          </ul>
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
      maxlength="100"
      show-word-limit
    />

    <template #footer>
      <el-button @click="editDialog.visible = false">取消</el-button>
      <el-button type="primary" @click="saveRemark">保存</el-button>
    </template>
  </el-dialog>

</template>




<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
import CategoryCardsList from '~/components/CategoryCardsList.vue';
import SkillCard from '~/components/SkillCard.vue';
import WeaponList from '~/components/WeaponList.vue';
import FormationComponent from '~/components/FormationComponent.vue';

import { Delete, Star, DocumentCopy, Refresh, Edit, Connection, Share } from '@element-plus/icons-vue';

import { exportIndexedDB, importIndexedDB } from '~/utils/dbTools.js';

// 使用拆分后的 composables（如果你尚未创建，请按前一条回复建立）
import { useAccountActions } from '~/composables/useAccountActions.js';
import { useDb } from '~/composables/useDb.js';

// ============== 从 composable 获取状态与方法 ==============
const {
  // 状态
  zangbaoLinks,
  newLink,
  newLinkRemark,
  showRemarkInput,
  showPriceInput,
  globalLoading,
  activeTabs,
  filterFavorites,
  sortKey,
  sortOrder,
  columnMode,
  currentPage,
  pageSize,
  minPriceInput,
  maxPriceInput,
  updateProgress,
  pagedLinks,
  filteredLinks,
  statusFilter,
  priceFilterType,
  newLinkPrice,

  // 方法
  loadLinksFromDB,
  addLink,
  removeLink,
  clearLinks,
  refreshLink,
  updateAll,
  toggleFavorite,
  toggleFilter,
  setSort,
  applyPriceFilter,
  clearPriceFilter,
  setStatusFilter,
  deleteFilteredResults
} = useAccountActions();

// ============== db 直接操作（用于编辑备注等） ==============
const { getRecord, saveRecord } = useDb();

// ============== 编辑备注对话框 ==============
const editDialog = reactive({
  visible: false,
  link: '',
  remark: ''
});

const editRecord = (item) => {
  editDialog.link = item.link;
  editDialog.remark = item.remark || '';
  editDialog.visible = true;
};

const saveRemark = async () => {
  try {
    const record = await getRecord(editDialog.link);
    if (record) {
      record.remark = editDialog.remark || '';
      await saveRecord(record);
      await loadLinksFromDB();
      editDialog.visible = false;
      ElMessage.success('备注已保存');
    } else {
      ElMessage.error('未找到记录');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('保存失败');
  }
};

// ============== 复制 / 打开链接 ==============
const copyUrl = (cbgLink, remark) => {
  const textToCopy = `${cbgLink}\n${remark || ''}`;

  // 优先使用现代API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        ElMessage({ message: '复制成功', type: 'success', zIndex: 99999 });
      })
      .catch(() => {
        fallbackCopy(textToCopy);
      });
  } else {
    // 非 https 环境自动使用 fallback
    fallbackCopy(textToCopy);
  }
};

// 兼容处理（textarea 方案）
const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (ok) {
    ElMessage({ message: '复制成功', type: 'success', zIndex: 99999 });
  } else {
    ElMessage({ message: '复制失败', type: 'error' });
  }
};


const openLink = (link) => {
  window.open(link, '_blank');
};

// ============== 格式化时间 ==============
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

// ============== 分页事件 ==============
const handlePageChange = (page) => {
  currentPage.value = page;
  nextTick(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

// ============== gridStyle 计算 ==============
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnMode.value}, 1fr)`
}));

// ============== 导出 / 导入 IndexedDB ==============
const exportDB = async () => {
  try {
    const ok = await exportIndexedDB('zangbaoDB');
    if (ok) ElMessage.success('数据已导出');
    else ElMessage.error('导出失败');
  } catch (err) {
    console.error(err);
    ElMessage.error('导出失败');
  }
};

const importDB = async (file) => {
  try {
    await ElMessageBox.confirm(
      '导入数据会覆盖当前 IndexedDB 中的所有记录，确定继续吗？',
      '确认导入',
      {
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    await importIndexedDB(file, 'zangbaoDB');
    ElMessage.success('数据已成功导入');
    // 导入后立即刷新
    await loadLinksFromDB();
  } catch (err) {
    // 用户取消或其他错误
    if (err === 'cancel' || err === 'close') {
      ElMessage.info('已取消导入');
      return false;
    }
    console.error(err);
    ElMessage.error('导入失败');
  }
  return false; // 阻止 el-upload 自动上传
};

// ============== 页面生命周期 ==============
onMounted(async () => {
  await loadLinksFromDB();
});
</script>

<style scoped>
/* 手机端屏幕宽度小于 768px 时隐藏按钮组 */
@media (max-width: 767px) {
  .column-selector {
    display: none;
  }
  .panel-header {
    flex-direction: column;
    align-items: stretch;
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

.remark-container{
  margin-top: 20px;
  margin-bottom: 8px;
}
.button-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
}

.filter-sort {
  margin-top: 12px;
  display: flex;
  gap: 1px;
  flex-wrap: wrap;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 10px;
}
.price-filter{
  align-items: center;
  margin-top: 12px;
  display: flex;
  gap: 1px;
  flex-wrap: wrap;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 10px;
}
.price-filter-input{
  display:inline-block
}
.filter-interval{
  margin: 0 10px;
  color: #ccc; 
  margin-bottom: 10px;
}
.select-filter{
  width: 120px; 
  margin-right: 5px; 
  margin-bottom: 10px;
}
.price-input{
  width: 80px; 
  margin-right: 3px; 
  margin-bottom: 10px;
}
.compare-results {
  margin-top: 16px;
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
/* 动态类：背景红色 */
.panel-header.bg-red {
  /* background-color: #ffe5e5 !important; */
  border-top: 1px solid #f02929;
}
.header-actions-top{
  margin-bottom: 10px;
}

.equip-header {
  font-size: 14px;
  line-height: 1.4;
  margin: 2px;
}

.price-main {
  font-size: 20px;
  font-weight: 600;
  margin-right: 8px;
  color: #f02929;
}

.price-estimated {
  font-size: 14px;
  color: #666;
}

.separator {
  margin: 0 8px; 
  color: #ccc;  
  font-size: 8px;
}

.price-percent {
  font-weight: 600;
}

/* 估价 > 实价：上涨逻辑 */
.price-percent.up {
  color: #d9534f; /* 红色 */
}

/* 估价 < 实价：便宜逻辑 */
.price-percent.down {
  color: #3cb371; /* 绿色 */
}

.equip-status {
  display: inline-block;
  font-size: 14px;
  color: #409eff;
}


.price-info {
  font-size: 12px;
  color: #666;
  padding-top: 8px;
}

.price-info b{
  color: #333;
}

.header-actions {
  margin-bottom: 8px;
}

.pagination-container {
  margin: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
.remark-textarea ::placeholder {
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>