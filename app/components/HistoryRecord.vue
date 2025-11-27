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
          <el-icon 
            @click="toggleFavorite(getOriginalIndex(index))" 
            class="favorite-icon"
            :class="{ favorited: record.isFavorited }"
          >
            <StarFilled v-if="record.isFavorited" />
            <Star v-else />
          </el-icon>
        </div>
        <div class="record-meta">
          <span class="record-time">估号时间: {{ record.timestamp }}</span>
          <el-icon @click="deleteRecord(getOriginalIndex(index))" class="btn-delete">
            <Delete />
          </el-icon>
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
import { DocumentCopy, Star, StarFilled,Delete } from '@element-plus/icons-vue'

export default {
  name: 'HistoryRecord',
  components: {
    DocumentCopy,
    Star,
    StarFilled,
    Delete
  },
  data() {
    return {
      historyRecords: [],
      historyUpdateHandler: null,
      currentPage: 1, // 当前页码
      pageSize: 8     // 每页显示记录数
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
          // 按时间倒序排列（最新的在最上面）
          this.historyRecords.sort((a, b) => {
            // 将收藏的记录排在前面
            if (a.isFavorited && !b.isFavorited) return -1;
            if (!a.isFavorited && b.isFavorited) return 1;
            
            // 时间倒序排列（最新的在前面）
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
          });
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
      // 初始化收藏状态
      if (record.isFavorited === undefined) {
        record.isFavorited = false;
      }
      
      // 查找是否已存在相同链接的记录
      const existingIndex = this.historyRecords.findIndex(item => item.cbgLink === record.cbgLink);
      
      if (existingIndex !== -1) {
        // 如果存在，则更新时间戳和其他可能变化的字段
        this.historyRecords[existingIndex].timestamp = record.timestamp;
        this.historyRecords[existingIndex].estimatedPrice = record.estimatedPrice;
        this.historyRecords[existingIndex].zangbaoPrice = record.zangbaoPrice;
        this.historyRecords[existingIndex].grid = record.grid;
        this.historyRecords[existingIndex].bao = record.bao;
      } else {
        // 如果不存在，则添加新记录
        this.historyRecords.push(record);
      }
      
      // 重新排序：收藏的记录在前，非收藏的记录按时间倒序排列
      this.historyRecords.sort((a, b) => {
        // 将收藏的记录排在前面
        if (a.isFavorited && !b.isFavorited) return -1;
        if (!a.isFavorited && b.isFavorited) return 1;
        
        // 时间倒序排列（最新的在前面）
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
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
    },
    
    // 切换收藏状态
    toggleFavorite(index) {
      // 确保记录有isFavorited属性
      if (this.historyRecords[index].isFavorited === undefined) {
        this.historyRecords[index].isFavorited = false;
      }
      
      // 切换收藏状态
      this.historyRecords[index].isFavorited = !this.historyRecords[index].isFavorited;
      
      // 重新排序，将收藏的记录放在前面
      this.historyRecords.sort((a, b) => {
        // 将收藏的记录排在前面
        if (a.isFavorited && !b.isFavorited) return -1;
        if (!a.isFavorited && b.isFavorited) return 1;
        
        // 时间倒序排列（最新的在前面）
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
      this.saveRecords();
      
      // 通知其他组件历史记录已更新
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('historyRecordUpdated', { detail: this.historyRecords }));
      }
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
  background-color: #e35151;
  color: #fff;
  border: none;
  padding: 4px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete:hover,
.btn-clear:hover {
  background-color: #c82333;
  color: #fff;
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

.favorite-icon {
  cursor: pointer;
  margin-left: 8px;
  color: #ccc;
}

.favorite-icon.favorited {
  color: #ffd700;
}
</style>