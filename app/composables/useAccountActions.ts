// composables/useAccountActions.ts
import { ref, computed, reactive } from 'vue'
// @ts-ignore - element-plus nuxt provides types
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDb } from './useDb'
import { useFetchData } from './useFetchData'

interface LinkItem {
  link: string
  timestamp: number
  isFavorite: boolean
  equipPrice: number | null
  estimatedPrice: number | null
  data: any
  loading: boolean
  remark: string
  statusDesc: string
}

export const useAccountActions = () => {
  const { saveRecord, getRecord, deleteRecord, loadAllRecords, clearAllRecords } = useDb()
  const { fetchAccountData } = useFetchData()

  // 所有状态
  const zangbaoLinks = ref<LinkItem[]>([])
  const newLink = ref('')
  const newLinkRemark = ref('')
  const showRemarkInput = ref(false)
  const showPriceInput = ref(false)
  const globalLoading = ref(false)
  const activeTabs = reactive<Record<string, string>>({})

  const statusFilter = ref('')
  const filterFavorites = ref(false)
  const sortKey = ref('time')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const columnMode = ref(2)
  const currentPage = ref(1)
  const pageSize = ref(6)

  const minPriceInput = ref('')
  const maxPriceInput = ref('')
  const minPriceFilter = ref('')
  const maxPriceFilter = ref('')

  const priceFilterType = ref<'equipPrice' | 'estimatedPrice'>('equipPrice')

  const updateProgress = ref('')

  const newLinkPrice = ref('')

  // 解析备注行（去空行）
  const parseRemarkLines = (text: string): string[] => {
    if (!text) return []
    return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  }

  // 限制备注100字符
  const limitRemark = (text: string): string => {
    if (!text) return ''
    const s = text.trim()
    return s.length > 38 ? s.slice(0, 38) : s
  }

  // 按 index 选择最终 remark
  const pickRemarkForIndex = (links: string[], remarks: string[], index: number): string => {
    if (links.length === 1) {
      return remarks.length > 0 ? limitRemark(remarks.join(' ')) : ''
    }
    if (remarks.length === 0) return ''
    if (remarks.length === 1) return limitRemark(remarks[0] || '')
    return remarks.length >= index ? limitRemark(remarks[index - 1] || '') : ''
  }

  // 解析多个藏宝阁ID
  const extractCbgLink = (text: string): string[] => {
    const idPattern = /\d{15}-1-[A-Z0-9]{14}/gi
    const ids = text.match(idPattern) as string[] | null
    if (!ids) return []
    return ids.map((id) => `https://stzb.cbg.163.com/cgi/mweb/equip/1/${id}`)
  }

  const normalizeLink = (link: string): string => {
    try {
      const url = new URL(link)
      return url.origin + url.pathname
    } catch {
      return link
    }
  }

  // 加载所有纪录
  const loadLinksFromDB = async () => {
    const all = await loadAllRecords()
    zangbaoLinks.value = all.map((r: any) => ({
      link: r.link,
      timestamp: r.timestamp,
      isFavorite: r.isFavorite,
      equipPrice: r.equipPrice,
      data: r.data || null,
      loading: false,
      remark: r.remark || '',
      statusDesc: r.statusDesc,
      estimatedPrice: r.estimatedPrice,
    }))

    zangbaoLinks.value.forEach((i) => {
      activeTabs[i.link] = activeTabs[i.link] || 'first'
    })
  }

  // 添加
  const addLink = async () => {
    const input = newLink.value.trim()
    if (!input) {
      ElMessage.warning('请输入链接')
      return
    }

    const links = extractCbgLink(input)
    if (!links || links.length === 0) {
      ElMessage.warning('未识别到合法链接')
      return
    }

    const remarks = parseRemarkLines(newLinkRemark.value)
    const prices = parseRemarkLines(newLinkPrice.value)

    globalLoading.value = true
    const failed: string[] = []
    let index = 0

    try {
      for (const raw of links) {
        index++
        const link = normalizeLink(raw)
        const remarkToUse = pickRemarkForIndex(links, remarks, index)

        try {
          let record = await getRecord(link)
          if (record) {
            const processed = await fetchAccountData(link, record)
            record.data = processed
            const priceToUse = prices.length >= index ? Number(prices[index - 1]) : processed.equipPrice
            record.equipPrice = priceToUse
            record.estimatedPrice = processed.estimatedPrice
            record.timestamp = Date.now()
            if (remarkToUse.trim() !== '') {
              record.remark = remarkToUse.trim()
            }
            record.statusDesc = processed.statusDesc
            await saveRecord(record)
            ElMessage.success(`第 ${index} 个已存在，更新成功`)
          } else {
            const newRecord: any = {
              link,
              timestamp: Date.now(),
              isFavorite: false,
              data: null,
              remark: remarkToUse,
            }
            const processed = await fetchAccountData(link)
            newRecord.data = processed
            const priceToUse = prices.length >= index ? Number(prices[index - 1]) : processed.equipPrice
            newRecord.equipPrice = priceToUse
            newRecord.estimatedPrice = processed.estimatedPrice
            newRecord.statusDesc = processed.statusDesc
            await saveRecord(newRecord)
            ElMessage.success(`第 ${index} 个添加成功`)
          }

          await loadLinksFromDB()
        } catch (err) {
          console.error('处理链接失败：', link, err)
          failed.push(link)
          ElMessage.error(`第 ${index} 个失败`)
        }
      }
    } finally {
      globalLoading.value = false
      newLink.value = ''
      newLinkRemark.value = ''
      newLinkPrice.value = ''
    }

    if (failed.length) ElMessage.warning(`部分失败：${failed.length} 个`)
    else ElMessage.success('全部完成')
  }

  // 删除
  const removeLink = async (link: string) => {
    try {
      await ElMessageBox.confirm('确定删除该链接？', '提示', {
        type: 'warning',
      })
      await deleteRecord(link)
      await loadLinksFromDB()
      ElMessage.success('删除成功')
    } catch (err) {
      // 用户取消
    }
  }

  // 清空
  const clearLinks = async () => {
    try {
      await ElMessageBox.confirm('确定清空所有链接？', '提示', {
        type: 'warning',
      })
      await clearAllRecords()
      await loadLinksFromDB()
      ElMessage.success('已清空')
    } catch {
      // 用户取消
    }
  }

  // 删除当前筛选的所有结果
  const deleteFilteredResults = async () => {
    const list = filteredLinks.value || []

    if (!list.length) {
      ElMessage.info('当前没有筛选结果可删除')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定删除当前筛选到的 ${list.length} 条记录？此操作不可恢复。`,
        '删除确认',
        { type: 'warning' }
      )
    } catch {
      return
    }

    globalLoading.value = true
    updateProgress.value = `正在删除 0/${list.length}`
    const failed: string[] = []

    let idx = 0
    for (const item of list) {
      idx++
      updateProgress.value = `正在删除 ${idx}/${list.length}`
      try {
        await deleteRecord(item.link)
      } catch (err) {
        console.error('删除失败：', item.link, err)
        failed.push(item.link)
      }
    }

    await loadLinksFromDB()
    globalLoading.value = false
    updateProgress.value = ''
    currentPage.value = 1

    if (failed.length) {
      ElMessage.warning(`删除完成，但 ${failed.length} 条失败`)
    } else {
      ElMessage.success('删除完成')
    }
  }

  // 刷新
  const refreshLink = async (link: string) => {
    const item = zangbaoLinks.value.find((i) => i.link === link)
    if (!item) return

    item.loading = true

    try {
      const record = await getRecord(link)
      if (!record) return
      const processed = await fetchAccountData(link, null)
      record.data = processed
      record.equipPrice = processed.equipPrice
      record.estimatedPrice = processed.estimatedPrice
      record.statusDesc = processed.statusDesc
      await saveRecord(record)
      await loadLinksFromDB()
      ElMessage.success('刷新成功')
    } catch {
      ElMessage.error('刷新失败')
    } finally {
      item.loading = false
    }
  }

  // 更新全部
  const updateAll = async () => {
    const total = zangbaoLinks.value.length
    if (!total) return ElMessage.info('没有链接')

    globalLoading.value = true
    let index = 0

    for (const item of zangbaoLinks.value) {
      index++
      updateProgress.value = `正在更新 ${index}/${total}`

      const record = await getRecord(item.link)
      if (!record) continue

      try {
        const processed = await fetchAccountData(item.link, record)
        record.data = processed
        record.equipPrice = processed.equipPrice
        record.estimatedPrice = processed.estimatedPrice
        record.statusDesc = processed.statusDesc
        await saveRecord(record)
      } catch (err) {
        // 跳过失败的
      }
    }

    await loadLinksFromDB()
    globalLoading.value = false
    updateProgress.value = ''
    ElMessage.success('全部更新完成')
  }

  // 收藏
  const toggleFavorite = async (item: LinkItem) => {
    const record = await getRecord(item.link)
    if (!record) return

    record.isFavorite = !record.isFavorite
    await saveRecord(record)
    await loadLinksFromDB()
  }

  const setStatusFilter = (value: string) => {
    statusFilter.value = value
    currentPage.value = 1
  }

  const setSort = (key: string) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
    currentPage.value = 1
  }

  const toggleFilter = () => {
    filterFavorites.value = !filterFavorites.value
    currentPage.value = 1
  }

  const applyPriceFilter = () => {
    const min = minPriceInput.value.trim()
    const max = maxPriceInput.value.trim()

    if (min !== '' && isNaN(Number(min))) return ElMessage.warning('最低价无效')
    if (max !== '' && isNaN(Number(max))) return ElMessage.warning('最高价无效')

    minPriceFilter.value = min
    maxPriceFilter.value = max
    currentPage.value = 1
  }

  const clearPriceFilter = () => {
    minPriceInput.value = ''
    maxPriceInput.value = ''
    minPriceFilter.value = ''
    maxPriceFilter.value = ''
    currentPage.value = 1
  }

  const filteredLinks = computed(() => {
    let list = zangbaoLinks.value

    if (filterFavorites.value) {
      list = list.filter((i) => i.isFavorite)
    }

    const min = minPriceFilter.value === '' ? -Infinity : parseFloat(minPriceFilter.value)
    const max = maxPriceFilter.value === '' ? Infinity : parseFloat(maxPriceFilter.value)

    list = list.filter((i) => {
      const field = priceFilterType.value === 'equipPrice' ? i.equipPrice : i.estimatedPrice
      const price = field || 0
      return price >= min && price <= max
    })

    if (statusFilter.value) {
      list = list.filter((i) => i.statusDesc === statusFilter.value)
    }

    const key = sortKey.value
    const order = sortOrder.value

    return [...list].sort((a, b) => {
      let A: number, B: number

      if (key === 'price') {
        A = a.equipPrice || 0
        B = b.equipPrice || 0
      } else if (key === 'estimatedPrice') {
        A = a.estimatedPrice || 0
        B = b.estimatedPrice || 0
      } else if (key === 'ratio') {
        const aPrice = a.equipPrice || 1
        const bPrice = b.equipPrice || 1
        const aEst = a.estimatedPrice || 0
        const bEst = b.estimatedPrice || 0
        A = aEst / aPrice
        B = bEst / bPrice
      } else {
        A = a.timestamp
        B = b.timestamp
      }

      return order === 'asc' ? A - B : B - A
    })
  })

  const pagedLinks = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredLinks.value.slice(start, start + pageSize.value)
  })

  return {
    zangbaoLinks,
    newLink,
    newLinkRemark,
    showRemarkInput,
    showPriceInput,
    globalLoading,
    activeTabs,
    filterFavorites,
    sortKey,
    sortOrder,
    columnMode,
    currentPage,
    pageSize,
    minPriceInput,
    maxPriceInput,
    updateProgress,
    pagedLinks,
    filteredLinks,
    statusFilter,
    priceFilterType,
    newLinkPrice,

    loadLinksFromDB,
    addLink,
    removeLink,
    clearLinks,
    refreshLink,
    updateAll,
    toggleFavorite,
    toggleFilter,
    setSort,
    applyPriceFilter,
    clearPriceFilter,
    setStatusFilter,
    deleteFilteredResults,
  }
}