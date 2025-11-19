<script setup>

const ordersn = '202510281502116-1-RU4G0IXMKDLWYW'

const { data, pending, error } = useFetch('/api/equip/detail', {
  params: { ordersn }
})

console.log(data.value);

</script>

<template>
  <div>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">请求失败</div>
    <div v-else>
      equip.price: {{ data }}
    </div>
  </div>
</template>
