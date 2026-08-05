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

    <el-alert
      v-if="hasLegacyCookie"
      type="warning"
      title="检测到本机浏览器还保存着旧版Cookie，点击「一键迁移」可将其同步到服务器（长期有效）"
      :closable="false"
      style="margin-bottom: 12px;"
    />

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
    <el-button
      v-if="hasLegacyCookie"
      @click="migrateLegacyCookie"
      style="margin-top: 12px; margin-left: 8px;"
    >
      一键迁移旧Cookie
    </el-button>

    <div v-if="saved" style="margin-top: 12px; color: #67c23a;">
      ✅ Cookie已保存到服务器，之后会自动续期
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const cookieValue = ref('')
const saved = ref(false)
const hasLegacyCookie = ref(false)

onMounted(async () => {
  // 从旧版 localStorage 读取，仅用于一键迁移
  const legacyCookie = localStorage.getItem('cbg_cookie') || ''
  hasLegacyCookie.value = !!legacyCookie
  if (legacyCookie) {
    cookieValue.value = legacyCookie
  }

  try {
    // 读取服务器端已保存的 Cookie（覆盖旧版本地值，展示当前生效的）
    const res = await $fetch('/api/cookie')
    if (res?.cookie) {
      cookieValue.value = res.cookie
      saved.value = true
    }
  } catch {
    // 服务器读取失败时忽略，保持本地值
  }
})

const saveCookie = async () => {
  const val = cookieValue.value.trim()
  if (!val) {
    ElMessage.warning('请输入Cookie')
    return
  }
  try {
    await $fetch('/api/cookie', {
      method: 'POST',
      body: { cookie: val },
    })
    saved.value = true
    ElMessage.success('Cookie已保存，之后会自动续期')
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  }
}

const clearCookie = async () => {
  try {
    await $fetch('/api/cookie', { method: 'DELETE' })
  } catch {
    // 忽略服务器清除失败
  }
  localStorage.removeItem('cbg_cookie')
  cookieValue.value = ''
  saved.value = false
  hasLegacyCookie.value = false
  ElMessage.success('Cookie已清除')
}

const migrateLegacyCookie = async () => {
  const legacy = localStorage.getItem('cbg_cookie') || ''
  if (!legacy) return
  try {
    await $fetch('/api/cookie', {
      method: 'POST',
      body: { cookie: legacy },
    })
    localStorage.removeItem('cbg_cookie')
    hasLegacyCookie.value = false
    cookieValue.value = legacy
    saved.value = true
    ElMessage.success('旧Cookie已迁移到服务器，之后会自动续期')
  } catch {
    ElMessage.error('迁移失败，请稍后重试')
  }
}
</script>