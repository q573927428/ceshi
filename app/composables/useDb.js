// composables/useDb.js
// 从 IndexedDB 迁移到 MySQL 后端 API

export const useDb = () => {
  const saveRecord = async (record) => {
    const body = {
      link: record.link,
      timestamp: record.timestamp,
      isFavorite: !!record.isFavorite,
      equipPrice: record.equipPrice ?? null,
      estimatedPrice: record.estimatedPrice ?? null,
      statusDesc: record.statusDesc || '',
      remark: record.remark || null,
      data: record.data || null,
    }
    await $fetch('/api/records', {
      method: 'POST',
      body,
    })
  }

  const getRecord = async (link) => {
    try {
      return await $fetch(`/api/records/${encodeURIComponent(link)}`)
    } catch {
      return null
    }
  }

  const deleteRecord = async (link) => {
    await $fetch(`/api/records/${encodeURIComponent(link)}`, {
      method: 'DELETE',
    })
  }

  const loadAllRecords = async () => {
    try {
      return await $fetch('/api/records')
    } catch {
      return []
    }
  }

  const clearAllRecords = async () => {
    await $fetch('/api/records/clear', {
      method: 'DELETE',
    })
  }

  return {
    saveRecord,
    getRecord,
    deleteRecord,
    loadAllRecords,
    clearAllRecords,
  }
}