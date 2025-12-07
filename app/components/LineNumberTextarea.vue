<template>
    <div class="numbered-textarea">
      <!-- 行号区域 -->
      <div class="line-numbers">
        <span v-for="n in lineCount" :key="n">{{ n }}</span>
      </div>
  
      <!-- 内容 textarea -->
      <textarea
        class="content"
        v-model="model"
        :rows="rows"
        :placeholder="placeholder"
      >
      </textarea>
    </div>
</template>
  
<script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    modelValue: String,
    rows: { type: Number, default: 6 },
    placeholder: String
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const model = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })
  
  const lineCount = computed(() => {
    if (!model.value) return 1
    return model.value.split('\n').length
  })
</script>
  
<style scoped>
  .numbered-textarea {
    display: flex;
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    font-size: 14px;
    height: auto;
  }
  
  /* 行号栏 */
  .line-numbers {
    background: #f5f7fa;
    color: #909399;
    padding: 8px 6px;
    text-align: right;
    user-select: none;
    border-right: 1px solid #e4e7ed;
    overflow: hidden;
    line-height: 1.6;
  }
  
  .line-numbers span {
    display: block;
    white-space: nowrap;
  }
  
  /* 内容输入区 */
  .content {
    flex: 1;
    padding: 8px;
    border: none;
    outline: none;
    resize: none;
    line-height: 1.7;
    font-family: monospace;
  
    /* 不换行 + 横向滚动 */
    white-space: nowrap;
    overflow-x: auto;
  
    /* 纵向滚动 */
    overflow-y: auto;
  
    /* 手机能滑 */
    -webkit-overflow-scrolling: touch;
  }
  </style>
  