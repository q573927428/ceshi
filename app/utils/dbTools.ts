// utils/dbTools.ts
// 已从 IndexedDB 迁移到 MySQL，保留导入导出接口

/**
 * 一键导出所有记录为 JSON 文件（从 MySQL API 导出）
 */
export async function exportIndexedDB(dbName = 'zangbao-records'): Promise<boolean> {
  try {
    const records = await $fetch('/api/records')
    if (!records || !(records as any[]).length) {
      console.warn('没有数据可导出')
      return false
    }

    const exportData = { records }
    const jsonStr = JSON.stringify(exportData, null, 2)

    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url

    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    a.download = `${dbName}-backup-${dateStr}.json`

    a.click()
    URL.revokeObjectURL(url)

    return true
  } catch (err) {
    console.error('导出数据失败:', err)
    return false
  }
}

/**
 * 一键导入 JSON 备份文件到 MySQL（通过 API）
 */
export async function importIndexedDB(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(e.target!.result as string)
        const records = json.records || []

        if (!records.length) {
          resolve(false)
          return
        }

        let success = 0
        for (const record of records) {
          try {
            await $fetch('/api/records', {
              method: 'POST',
              body: {
                link: record.link,
                timestamp: record.timestamp,
                isFavorite: !!record.isFavorite,
                equipPrice: record.equipPrice ?? null,
                estimatedPrice: record.estimatedPrice ?? null,
                statusDesc: record.statusDesc || '',
                remark: record.remark || null,
                data: record.data || null,
              },
            })
            success++
          } catch (err) {
            console.error('导入记录失败:', record.link, err)
          }
        }

        console.log(`导入完成：${success}/${records.length}`)
        resolve(true)
      } catch (err) {
        console.error('导入数据失败:', err)
        reject(err)
      }
    }

    reader.onerror = reject
    reader.readAsText(file)
  })
}