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
  const saveRecord = async (record: RecordData): Promise<{ remaining?: number }> => {
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
    return await $fetch('/api/records', {
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
      // 默认只加载元数据（不含 data 字段）
      return await $fetch('/api/records')
    } catch {
      return []
    }
  }

  const loadPageRecords = async (page: number, pageSize: number): Promise<{ records: any[]; total: number; page: number; pageSize: number }> => {
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch('/api/records', {
        params: { page, pageSize, withData: 'true' },
      })
    } catch {
      return { records: [], total: 0, page, pageSize }
    }
  }

  const batchFetchRecords = async (links: string[]): Promise<any[]> => {
    if (!links.length) return []
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch('/api/records/batch', {
        method: 'POST',
        body: { links },
      })
    } catch {
      return []
    }
  }

  const preflightRecords = async (links: string[]) => {
    return await $fetch('/api/records/preflight', { method: 'POST', body: { links } }) as any
  }

  const loadAllRecordsWithData = async (): Promise<any[]> => {
    // 兼容旧逻辑 - 返回全部记录的完整数据（含 data）
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch('/api/records', {
        params: { page: 1, pageSize: 100000, withData: 'true' },
      }).then(res => (res as any).records || [])
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
    loadPageRecords,
    batchFetchRecords,
    preflightRecords,
    loadAllRecordsWithData,
    clearAllRecords,
  }
}
