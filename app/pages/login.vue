<template><div class="auth-page"><h2>登录</h2><el-input v-model="username" placeholder="用户名" /><el-input v-model="password" type="password" show-password placeholder="密码" /><p v-if="error" class="error">{{ error }}</p><el-button type="primary" :loading="loading" @click="submit">登录</el-button><el-button link @click="navigateTo('/register')">注册账号</el-button></div></template>
<script setup lang="ts">
const { login, loading, error, isLoggedIn } = useAuth(); const username = ref(''); const password = ref('')
onMounted(() => { if (isLoggedIn.value) navigateTo('/') })
const submit = async () => { try { await login(username.value, password.value); await navigateTo('/') } catch {} }
</script>
<style scoped>.auth-page{max-width:360px;margin:15vh auto;padding:32px;background:#fff}.auth-page>*{margin-bottom:14px;width:100%}.error{color:#f56c6c}</style>
