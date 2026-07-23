<template>
  <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
    <h2>藏宝阁Cookie设置</h2>
    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
      按以下步骤操作：
    </p>
    <ol style="font-size: 14px; margin-bottom: 20px;">
      <li>打开 <a href="https://stzb.cbg.163.com/" target="_blank">https://stzb.cbg.163.com/</a> 并扫码登录</li>
      <li>按 F12 → Network（网络）标签</li>
      <li>刷新页面，找到任意一个请求（如 <code>get_equip_detail</code>）</li>
      <li>点击该请求 → 找到 <strong>Request Headers</strong> 中的 <code>Cookie</code> 整行</li>
      <li>右键复制整行Cookie值（从 Cookie: 后面开始复制）</li>
      <li>粘贴到下方输入框并保存</li>
    </ol>
    <el-input
      v-model="cookieValue"
      type="textarea"
      :rows="6"
      placeholder="请粘贴完整的Cookie字符串..."
    />
    <el-button type="primary" @click="saveCookie" style="margin-top: 12px;">
      保存Cookie
    </el-button>
    <el-button @click="clearCookie" style="margin-top: 12px; margin-left: 8px;">
      清除Cookie
    </el-button>
    <div v-if="saved" style="margin-top: 12px; color: #67c23a;">
      ✅ Cookie已保存，现在可以正常使用工具了
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const cookieValue = ref('')
const saved = ref(false)

onMounted(() => {
  const savedCookie = localStorage.getItem('cbg_cookie')
  if (savedCookie) {
    cookieValue.value = savedCookie
    saved.value = true
  }
})

const saveCookie = () => {
  const val = cookieValue.value.trim()
  if (!val) {
    ElMessage.warning('请输入Cookie')
    return
  }
  localStorage.setItem('cbg_cookie', val)
  saved.value = true
  ElMessage.success('Cookie已保存')
}

const clearCookie = () => {
  localStorage.removeItem('cbg_cookie')
  cookieValue.value = ''
  saved.value = false
  ElMessage.success('Cookie已清除')
}
</script>