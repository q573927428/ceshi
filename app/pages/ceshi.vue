<script setup>
import { ref } from 'vue'

const url = ref('/api/get_equip_detail?client_type=h5&serverid=1&ordersn=202510281502116-1-RU4G0IXMKDLWYW') // 修改为代理路径
const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  if (!url.value) {
    error.value = '请输入有效的URL'
    return
  }

  loading.value = true
  error.value = null
  data.value = null

  try {
    const response = await fetch(url.value)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    data.value = result
  } catch (err) {
    error.value = '获取数据失败: ' + (err.message || '未知错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1>装备详情查询</h1>
    <div class="input-group">
      <input 
        v-model="url" 
        placeholder="请输入URL" 
        class="url-input"
      />
      <button @click="fetchData" class="fetch-button">获取数据</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="data" class="result">
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  display: flex;
  margin-bottom: 20px;
}

.url-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.fetch-button {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 14px;
}

.fetch-button:hover {
  background-color: #337ecc;
}

.loading, .error {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.loading {
  background-color: #f0f9ff;
  color: #409eff;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.result {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>