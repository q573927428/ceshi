<template>
  <div class="rent-page">

    <!-- 添加按钮 -->
    <div class="add-btn-wrap">
      <el-button type="primary" @click="openAddDialog">新增账号</el-button>
    </div>

    <!-- 账号卡片列表 -->
    <el-row :gutter  ="20">
      <el-col
        v-for="item in accounts"
        :key="item.id"
        :xs="24"
        :sm="12"
      >
        <el-card shadow="hover" class="rent-card">

          <!-- 头像 + 幻灯片 -->
          <div class="top-section">
            <img class="avatar" :src="item.avatar" />

            <el-carousel height="160px" indicator-position="outside">
              <el-carousel-item v-for="(img, idx) in item.images" :key="idx">
                <img class="slide-img" :src="img" />
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="info-section">
            <div class="title-row">
              <el-tag type="warning">出租中</el-tag>
              <span class="title">{{ item.code }}</span>
            </div>

            <div class="detail-list">
              <div>出租价格：<span class="price">{{ item.price }}</span></div>
              <div>进驻战：{{ item.date }}</div>
              <div>押金：{{ item.deposit }}</div>
              <div>底价/王：{{ item.money }}</div>
            </div>

            <el-progress :percentage="item.progress" :stroke-width="6" />

            <div class="desc">{{ item.desc }}</div>
          </div>

        </el-card>
      </el-col>
    </el-row>

    <!-- 新增账号弹窗 -->
    <el-dialog title="新增账号" v-model="dialogVisible" width="480px">
      
      <el-form :model="form" label-width="90px">

        <!-- 头像上传 -->
        <el-form-item label="头像">
          <el-upload
            action=""
            :on-change="file => handleUpload(file, 'avatar')"
            :auto-upload="false"
            accept="image/*"
          >
            <el-button type="primary">上传头像</el-button>
          </el-upload>
          <img v-if="form.avatar" :src="form.avatar" class="preview-avatar" />
        </el-form-item>

        <!-- 幻灯片图片上传 -->
        <el-form-item label="幻灯片">
          <el-upload
            action=""
            multiple
            :on-change="file => handleUpload(file, 'images')"
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

        <el-form-item label="进驻战">
          <el-input v-model="form.date" />
        </el-form-item>

        <el-form-item label="押金">
          <el-input v-model.number="form.deposit" />
        </el-form-item>

        <el-form-item label="底价/王">
          <el-input v-model.number="form.money" />
        </el-form-item>

        <el-form-item label="进度(%)">
          <el-input v-model.number="form.progress" />
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

// ----------------------------
// 账号数据（localStorage 持久化）
// ----------------------------
const accounts = ref([])

onMounted(() => {
  const saved = localStorage.getItem("rent-accounts")
  accounts.value = saved ? JSON.parse(saved) : []
})

const saveToLocalStorage = () => {
  localStorage.setItem("rent-accounts", JSON.stringify(accounts.value))
}

// ----------------------------
// 新增账号弹窗
// ----------------------------
const dialogVisible = ref(false)

const form = ref({
  avatar: "",
  images: [],
  code: "",
  price: "",
  date: "",
  deposit: "",
  money: "",
  progress: 0,
  desc: ""
})

const openAddDialog = () => {
  dialogVisible.value = true
  // 清空表单
  Object.assign(form.value, {
    avatar: "",
    images: [],
    code: "",
    price: "",
    date: "",
    deposit: "",
    money: "",
    progress: 0,
    desc: ""
  })
}

// ----------------------------
// 图片上传（本地转 Base64）
// ----------------------------
const handleUpload = (file, field) => {
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result
    if (field === "avatar") {
      form.value.avatar = base64
    } else {
      form.value.images.push(base64)
    }
  }
  reader.readAsDataURL(file.raw)
}

// ----------------------------
// 保存账号
// ----------------------------
const saveAccount = () => {
  accounts.value.push({
    id: Date.now(),
    ...form.value
  })

  saveToLocalStorage()
  dialogVisible.value = false
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

.top-section {
  display: flex;
  gap: 10px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-left: 10px;
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
