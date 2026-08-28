<template>
  <div class="recharge">
    <h2>充值中心</h2><p>充值规则：1 元 = 10 金币，1 金币可添加 1 个藏宝阁账号。</p>
    <div class="plans-grid">
      <el-card v-for="p in plans" :key="p.id" class="plan" :class="{ selected: selectedPlanId === p.id }" @click="selectedPlanId = p.id">
        <div class="plan-check"><el-radio v-model="selectedPlanId" :label="p.id">{{ p.name }}</el-radio></div>
        <p>{{ p.description }}</p><strong>¥{{ (p.amountFen / 100).toFixed(2) }}</strong>
      </el-card>
    </div>
    <el-button class="pay-button" type="primary" size="large" :loading="!!paying" :disabled="!selectedPlanId" @click="buy">立即付款</el-button>
    <el-alert v-if="message" :title="message" type="info" :closable="false" />
    <el-dialog v-model="showPay" title="微信扫码支付" width="340px" align-center @closed="stopPolling">
      <div v-if="payment?.codeUrl && !paid" class="payment-box"><img class="qr" :src="qrImageUrl" alt="微信支付二维码" /><p>请使用微信扫描二维码完成支付</p><small>订单号：{{ orderNo }}</small><el-button class="copy" @click="copyCodeUrl">复制支付链接</el-button></div>
      <div v-else-if="paid" class="payment-box success"><el-result icon="success" title="支付成功" sub-title="金币已到账，可以继续添加账号" /></div>
      <el-alert v-else title="未返回二维码，请检查微信支付配置或稍后重试" type="warning" :closable="false" />
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
const plans = ref<any[]>([]); const selectedPlanId = ref(''); const message = ref(''); const paying = ref(''); const showPay = ref(false); const orderNo = ref(''); const payment = ref<any>(null); const paid = ref(false); let pollTimer: ReturnType<typeof setInterval> | undefined
const { load: reloadUser } = useAuth()
const qrImageUrl = computed(() => payment.value?.codeUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payment.value.codeUrl)}` : '')
onMounted(async () => { plans.value = (await $fetch<any>('/api/plans')).plans; selectedPlanId.value = plans.value[0]?.id || '' })
const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = undefined } }
const pollStatus = async () => { if (!orderNo.value || paid.value) return; try { const result: any = await $fetch('/api/payment/status', { query: { orderNo: orderNo.value } }); if (result.order?.status === 'paid') { paid.value = true; stopPolling(); await reloadUser(true); ElMessage.success('支付成功，金币已到账'); } } catch {} }
const buy = async () => { if (!selectedPlanId.value) return; stopPolling(); paid.value = false; paying.value = selectedPlanId.value; message.value = ''; try { const result: any = await $fetch('/api/payment/create', { method: 'POST', body: { planId: selectedPlanId.value } }); orderNo.value = result.orderNo; payment.value = result.payment || result; if (payment.value?.codeUrl) { showPay.value = true; pollTimer = setInterval(pollStatus, 2500); } else message.value = result.message || `订单号：${result.orderNo}` } catch (error: any) { message.value = error?.data?.message || error?.message || '创建支付订单失败' } finally { paying.value = '' } }
const copyCodeUrl = async () => { if (payment.value?.codeUrl) { await navigator.clipboard?.writeText(payment.value.codeUrl); message.value = '支付链接已复制' } }
onBeforeUnmount(stopPolling)
</script>
<style scoped>
.recharge{max-width:760px;margin:30px auto}.plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.plan{margin:0;cursor:pointer;border:1px solid #dcdfe6;transition:border-color .2s,box-shadow .2s}.plan.selected{border-color:#409eff;box-shadow:0 0 0 1px #409eff}.plan-check{margin-bottom:8px}.plan p{min-height:40px;color:#606266;font-size:13px}.plan strong{display:block;color:#e53935;font-size:22px}.pay-button{display:block;margin:24px auto 18px;min-width:180px}.payment-box{text-align:center}.qr{width:240px;height:240px;display:block;margin:0 auto 12px;image-rendering:pixelated}.payment-box p{margin:8px 0;color:#333}.payment-box small{display:block;color:#888;word-break:break-all}.copy{margin-top:14px}.success{padding:8px 0}
</style>
