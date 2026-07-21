// composables/useDb.ts
// 从 IndexedDB 迁移到 MySQL 后端 API

interface RecordData {
  link: string
  timestamp?: number
  isFavorite?: boolean
  equipPrice?: number | null
  estimatedPrice?: number | null
  statusDesc?: string
  remark?: string | null
  data?: any
  [key: string]: any
}

export const useDb = () => {
  const saveRecord = async (record: RecordData): Promise<void> => {
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
    // @ts-ignore - Nuxt $fetch has complex route types
    await $fetch('/api/records', {
      method: 'POST',
      body,
    })
  }

  const getRecord = async (link: string): Promise<any> => {
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch(`/api/records/${encodeURIComponent(link)}`)
    } catch {
      return null
    }
  }

  const deleteRecord = async (link: string): Promise<void> => {
    // @ts-ignore - Nuxt $fetch has complex route types
    await $fetch(`/api/records/${encodeURIComponent(link)}`, {
      method: 'DELETE',
    })
  }

  const loadAllRecords = async (): Promise<any[]> => {
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch('/api/records')
    } catch {
      return []
    }
  }

  const clearAllRecords = async (): Promise<void> => {
    // @ts-ignore - Nuxt $fetch has complex route types
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