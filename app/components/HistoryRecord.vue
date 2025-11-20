<template>
  <div class="history-record">
    <div v-if="paginatedRecords.length === 0" class="no-record">
      暂无历史记录
    </div>
    <ul v-else class="record-list">
      <li v-for="(record, index) in paginatedRecords" :key="index" class="record-item">
        <div class="record-header">
          <span class="record-title">估算价格: {{ record.estimatedPrice }}</span>
          <!-- <span class="record-subtitle">(格:{{ record.grid }}宝:{{ record.bao }})</span> -->
          <span class="record-price">( 藏宝阁价格: {{ record.zangbaoPrice }} )</span>
        </div>
        <div class="record-link">
          cbg链接:
          <a :href="record.cbgLink" target="_blank" rel="noopener noreferrer">
             {{ record.cbgLink }}
          </a>
          <el-icon @click="copyUrl(record.cbgLink)" class="copyCbgLink">
            <DocumentCopy />
          </el-icon>
        </div>
        <div class="record-meta">
          <span class="record-time">估号时间: {{ record.timestamp }}</span>
          <button @click="deleteRecord(getOriginalIndex(index))" class="btn-delete">删除</button>
        </div>
      </li>
    </ul>
    
    <!-- 分页组件 -->
    <div class="pagination" v-if="totalPages > 1">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="historyRecords.length"
        layout="prev, pager, next"
        background
      />
    </div>
    
    <div class="actions">
      <button @click="clearAllRecords" class="btn-clear">清空所有记录</button>
    </div>
  </div>
</template>

<script>
import { DocumentCopy } from '@element-plus/icons-vue'
export default {
  name: 'HistoryRecord',
  components: {
    DocumentCopy
  },
  data() {
    return {
      historyRecords: [],
      historyUpdateHandler: null,
      currentPage: 1, // 当前页码
      pageSize: 5     // 每页显示记录数
    };
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.historyRecords.length / this.pageSize);
    },
    
    // 获取当前页的记录
    paginatedRecords() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.historyRecords.slice(start, end);
    }
  },
  created() {
    // 确保只在浏览器环境中访问localStorage
    if (process.client && typeof localStorage !== 'undefined') {
      this.loadRecords();
    }
  },
  mounted() {
    // 监听自定义事件以更新历史记录
    if (typeof window !== 'undefined') {
      this.historyUpdateHandler = (event) => {
        if (event.detail) {
          this.historyRecords = event.detail;
          // 如果当前页没有数据且不是第一页，返回上一页
          if (this.paginatedRecords.length === 0 && this.currentPage > 1) {
            this.currentPage = Math.max(1, Math.ceil(this.historyRecords.length / this.pageSize));
          }
        }
      };
      window.addEventListener('historyRecordUpdated', this.historyUpdateHandler);
    }
  },
  beforeUnmount() {
    // 清理事件监听器
    if (typeof window !== 'undefined' && this.historyUpdateHandler) {
      window.removeEventListener('historyRecordUpdated', this.historyUpdateHandler);
    }
  },
  methods: {
    loadRecords() {
      // 添加localStorage存在性检查
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('zangbaoHistory');
        if (saved) {
          this.historyRecords = JSON.parse(saved);
        }
      }
    },
    copyUrl(cbgLink) {
      navigator.clipboard.writeText(cbgLink)
      ElMessage({
        message: '复制成功',
        type: 'success',
        zIndex: 99999
      })
    },
    saveRecords() {
      // 添加localStorage存在性检查
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('zangbaoHistory', JSON.stringify(this.historyRecords));
      }
    },
    deleteRecord(index) {
      this.historyRecords.splice(index, 1);
      this.saveRecords();
      
      // 通知其他组件历史记录已更新
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('historyRecordUpdated', { detail: this.historyRecords }));
      }
    },
    clearAllRecords() {
      this.historyRecords = [];
      this.currentPage = 1;
      this.saveRecords();
      
      // 通知其他组件历史记录已更新
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('historyRecordUpdated', { detail: this.historyRecords }));
      }
    },
    addRecord(record) {
      this.historyRecords.unshift(record);
      this.currentPage = 1; // 添加新记录时回到第一页
      this.saveRecords();
      
      // 通知其他组件历史记录已更新
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('historyRecordUpdated', { detail: this.historyRecords }));
      }
    },
    
    // 处理页码变化
    handlePageChange(page) {
      this.currentPage = page;
    },
    
    // 根据当前页和索引计算原始索引
    getOriginalIndex(index) {
      return (this.currentPage - 1) * this.pageSize + index;
    }
  }
};
</script>

<style scoped>
.history-record {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 20px;
}

.history-record h3 {
  margin-top: 0;
  color: #333;
}

.no-record {
  text-align: center;
  color: #999;
  padding: 20px;
}

.record-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.record-item {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.record-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.record-title {
  font-weight: bold;
  color: #333;
}

.record-subtitle {
  font-size: 12px;
  color: #666;
}

.record-price {
  font-size: 12px;
  color: #007bff;
}

.record-link a {
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
}

.record-link a:hover {
  text-decoration: underline;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.btn-delete,
.btn-clear {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover,
.btn-clear:hover {
  background-color: #c82333;
}

.actions {
  margin-top: 16px;
  text-align: right;
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.copyCbgLink{
  cursor: pointer;
  margin-left: 8px;
}

</style>