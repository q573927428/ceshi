<template>
  <div class="rent-page">

    <!-- 添加按钮 -->
    <div class="add-btn-wrap">
      <el-button type="primary" @click="openAddDialog">新增账号</el-button>
    </div>

    <!-- 账号卡片列表 -->
    <el-row :gutter="10">
      <el-col
        v-for="item in accounts"
        :key="item.id"
        :xs="24"
        :sm="8"
      >
        <el-card shadow="hover" class="rent-card">

          <!-- 幻灯片 -->
          <el-carousel height="160px" indicator-position="outside">
            <el-carousel-item v-for="(img, idx) in item.images" :key="idx">
              <img class="slide-img" :src="img" />
            </el-carousel-item>
          </el-carousel>

          <div class="info-section">
            <div class="title-row">
              <el-tag :type="item.backupTime > Date.now() ? 'warning' : 'success'">
                {{ item.backupTime > Date.now() ? '出租中' : '备战区' }}
              </el-tag>
              <span class="title">{{ item.code }}</span>
            </div>

            <div class="detail-list">
              <div>出租价格：<span class="price">{{ item.price }}</span></div>
              <div>进备战时间：{{ formatTime(item.backupTime) }}</div>
              <div>押金：{{ item.deposit }}</div>
              <div>底价/王：{{ item.money }}</div>
            </div>

            <div class="desc">{{ item.desc }}</div>

            <!-- 修改按钮 -->
            <div class="card-actions" style="margin-top: 10px; text-align: right;">
              <el-button type="primary" size="mini" @click="editAccount(item)">修改</el-button>
            </div>
          </div>

        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/修改账号弹窗 -->
    <el-dialog :title="editingId ? '修改账号' : '新增账号'" v-model="dialogVisible" width="480px">
      <el-form :model="form" label-width="90px">

        <!-- 幻灯片图片上传 -->
        <el-form-item label="幻灯片">
          <el-upload
            action=""
            multiple
            :on-change="handleUpload"
            :auto-upload="false"
            accept="image/*"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
          <div class="preview-list">
            <img v-for="(img, index) in form.images" :src="img" :key="index" class="preview-img" />
          </div>
        </el-form-item>

        <el-form-item label="编号">
          <el-input v-model="form.code" placeholder="例如 ST29" />
        </el-form-item>

        <el-form-item label="价格">
          <el-input v-model.number="form.price" />
        </el-form-item>

        <el-form-item label="进备战时间">
          <el-date-picker
            v-model="form.backupTime"
            type="datetime"
            placeholder="选择进备战时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="x"
          />
        </el-form-item>

        <el-form-item label="押金">
          <el-input v-model.number="form.deposit" />
        </el-form-item>

        <el-form-item label="底价/王">
          <el-input v-model.number="form.money" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" rows="3" v-model="form.desc" />
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAccount">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const accounts = ref([])

onMounted(() => {
  if (typeof window === 'undefined') return
  const saved = localStorage.getItem("rent-accounts")
  accounts.value = saved ? JSON.parse(saved) : []
})

const saveToLocalStorage = () => {
  localStorage.setItem("rent-accounts", JSON.stringify(accounts.value))
}

// 弹窗 & 表单
const dialogVisible = ref(false)
const form = ref({
  images: [], // 存路径
  code: "",
  price: 0,
  backupTime: Date.now(),
  deposit: 0,
  money: 0,
  desc: ""
})

const editingId = ref(null) // 当前编辑账号id

const resetForm = () => {
  Object.assign(form.value, {
    images: [],
    code: "",
    price: 0,
    backupTime: Date.now(),
    deposit: 0,
    money: 0,
    desc: ""
  })
}

// 打开新增弹窗
const openAddDialog = () => {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑账号
const editAccount = (item) => {
  editingId.value = item.id
  Object.assign(form.value, { ...item })
  dialogVisible.value = true
}

// 上传图片到服务器
const handleUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw)
  const res = await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  // 保存路径
  form.value.images.push(...res.data.paths)
}

// 保存账号
const saveAccount = () => {
  if (editingId.value) {
    // 编辑模式
    const index = accounts.value.findIndex(a => a.id === editingId.value)
    if (index !== -1) accounts.value[index] = { id: editingId.value, ...form.value }
  } else {
    // 新增模式
    accounts.value.push({ id: Date.now(), ...form.value })
  }
  saveToLocalStorage()
  dialogVisible.value = false
  editingId.value = null
  resetForm()
}

// 格式化时间显示
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}`
}
</script>

<style scoped>
.rent-card {
  margin-bottom: 20px;
  border-radius: 10px;
}
.add-btn-wrap {
  margin-bottom: 20px;
}
.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.preview-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}
.info-section {
  padding: 10px 5px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.title {
  font-weight: bold;
  font-size: 18px;
}
.price {
  color: #e53935;
  font-weight: bold;
}
.desc {
  font-size: 14px;
  color: #444;
}
</style>
