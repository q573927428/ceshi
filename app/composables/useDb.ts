// composables/useDb.ts
// 从 IndexedDB 迁移到 MySQL 后端 API

interface RecordData {
  link: string
  timestamp?: number
  isFavorite?: boolean
  equipPrice?: number | null
  userPrice?: number | null
  estimatedPrice?: number | null
  statusDesc?: string
  remark?: string | null
  userRemark?: string | null
  data?: any
  [key: string]: any
}

interface RecordsPage {
  records: RecordData[]
  total: number
  page: number
  pageSize: number
}

export const useDb = () => {
  const saveRecord = async (record: RecordData): Promise<{ remaining?: number }> => {
    const normalizePrice = (value: unknown): number | null => {
      if (value === null || value === undefined || value === '') return null
      const numberValue = Number(value)
      return Number.isFinite(numberValue) ? Math.round(numberValue) : null
    }
    const body = {
      link: record.link,
      timestamp: record.timestamp,
      isFavorite: !!record.isFavorite,
      equipPrice: normalizePrice(record.equipPrice),
      userPrice: normalizePrice(record.userPrice),
      estimatedPrice: normalizePrice(record.estimatedPrice),
      statusDesc: record.statusDesc || '',
      remark: record.remark || null,
      userRemark: record.userRemark || null,
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

  const loadPageRecords = async (page: number, pageSize: number): Promise<RecordsPage> => {
    try {
      const response: unknown = await $fetch('/api/records', {
        params: { page, pageSize },
      })
      // 此接口会根据 pageSize 返回列表或分页对象，调用方在此固定使用分页模式。
      return response as RecordsPage
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

  const searchRecords = async (
    search: string,
    heroes: Array<{ heroId: number; name: string; minAdvance: number }> = [],
    skills: string[] = [],
  ): Promise<any[]> => {
    try {
      // @ts-ignore - Nuxt $fetch has complex route types
      return await $fetch('/api/records', {
        params: { search, heroes: JSON.stringify(heroes), skills: JSON.stringify(skills) },
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
        params: { page: 1, pageSize: 100000 },
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
    searchRecords,
    loadPageRecords,
    batchFetchRecords,
    preflightRecords,
    loadAllRecordsWithData,
    clearAllRecords,
  }
}
