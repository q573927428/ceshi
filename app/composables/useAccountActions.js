// composables/useAccountActions.js
import { ref, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDb } from './useDb';
import { useFetchData } from './useFetchData';

export const useAccountActions = () => {

  const {
    saveRecord,
    getRecord,
    deleteRecord,
    loadAllRecords,
    clearAllRecords
  } = useDb();

  const { fetchAccountData } = useFetchData();

  // 所有状态
  const zangbaoLinks = ref([]);
  const newLink = ref('');
  const newLinkRemark = ref('');
  const showRemarkInput = ref(true);
  const globalLoading = ref(false);
  const activeTabs = reactive({});

  const statusFilter = ref(''); 
  const filterFavorites = ref(false);
  const sortKey = ref('time');
  const sortOrder = ref('desc');
  const columnMode = ref(2);
  const currentPage = ref(1);
  const pageSize = ref(6);

  const minPriceInput = ref('');
  const maxPriceInput = ref('');
  const minPriceFilter = ref('');
  const maxPriceFilter = ref('');

  const priceFilterType = ref('equipPrice');  

  const updateProgress = ref('');

  const newLinkPrice = ref('');

  // 解析备注行（去空行）
const parseRemarkLines = (text) => {
  if (!text) return [];
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
};

// 限制备注100字符
const limitRemark = (text) => {
  if (!text) return '';
  const s = text.trim();
  return s.length > 38 ? s.slice(0, 38) : s;
};

// 按 index 选择最终 remark（links: 数组, remarks: 数组, index: 1-based）
const pickRemarkForIndex = (links, remarks, index) => {
  if (links.length === 1) {
    // 单链接：多行合并
    return remarks.length > 0 ? limitRemark(remarks.join(' ')) : '';
  }
  // 多链接：
  if (remarks.length === 0) return '';
  if (remarks.length === 1) return limitRemark(remarks[0]);
  // 多备注且多链接：按行匹配（不足返回空）
  return remarks.length >= index ? limitRemark(remarks[index - 1]) : '';
};

  // 解析多个藏宝阁ID
  const extractCbgLink = (text) => {
    const idPattern = /\d{15}-1-[A-Z0-9]{14}/gi;
    const ids = text.match(idPattern);
    if (!ids) return [];
    return ids.map(id => `https://stzb.cbg.163.com/cgi/mweb/equip/1/${id}`);
  };

  const normalizeLink = (link) => {
    try {
      const url = new URL(link);
      return url.origin + url.pathname;
    } catch {
      return link;
    }
  };

  // 加载所有纪录
  const loadLinksFromDB = async () => {
    const all = await loadAllRecords();
    zangbaoLinks.value = all.map(r => ({
      link: r.link,
      timestamp: r.timestamp,
      isFavorite: r.isFavorite,
      equipPrice: r.equipPrice,
      data: r.data || null,
      loading: false,
      remark: r.remark || '',
      statusDesc: r.statusDesc,
      estimatedPrice: r.estimatedPrice,
    }));

    zangbaoLinks.value.forEach(i => {
      activeTabs[i.link] = activeTabs[i.link] || 'first';
    });
  };

  // 添加
  const addLink = async () => {
    const input = newLink.value.trim();
    if (!input) {
      ElMessage.warning('请输入链接');
      return;
    }
  
    const links = extractCbgLink(input);
    if (!links || links.length === 0) {
      ElMessage.warning('未识别到合法链接');
      return;
    }
  
    // 先解析备注行（可为空数组）
    const remarks = parseRemarkLines(newLinkRemark.value);
    const prices = parseRemarkLines(newLinkPrice.value);
    
    globalLoading.value = true;
    const failed = [];
    let index = 0;
  
    try {
      for (const raw of links) {
        index++; // index 从 1 开始传入 pickRemarkForIndex
        const link = normalizeLink(raw);
  
        // 在循环内按当前 index 选取 remark
        const remarkToUse = pickRemarkForIndex(links, remarks, index);
  
        try {
          let record = await getRecord(link);
          if (record) {
            // 更新已有记录
            const processed = await fetchAccountData(link, record);
            record.data = processed;
            // 如果手动输入价格，则使用填写的
            const priceToUse = prices.length >= index 
              ? Number(prices[index - 1]) 
              : processed.equipPrice;
            record.equipPrice = priceToUse;

            record.estimatedPrice = processed.estimatedPrice;
            record.timestamp = Date.now();
            record.remark = remarkToUse;
            record.statusDesc = processed.statusDesc;
            await saveRecord(record);
            ElMessage.success(`第 ${index} 个已存在，更新成功`);
          } else {
            // 新建记录
            const newRecord = {
              link,
              timestamp: Date.now(),
              isFavorite: false,
              data: null,
              remark: remarkToUse
            };
            const processed = await fetchAccountData(link);
            newRecord.data = processed;
            // 如果手动输入价格，则使用填写的
            const priceToUse = prices.length >= index 
              ? Number(prices[index - 1]) 
              : processed.equipPrice;
            newRecord.equipPrice = priceToUse;

            newRecord.estimatedPrice = processed.estimatedPrice;
            newRecord.statusDesc = processed.statusDesc;
            await saveRecord(newRecord);
            ElMessage.success(`第 ${index} 个添加成功`);
          }
  
          // 每处理一条刷新列表（保留你现有行为）
          await loadLinksFromDB();
  
        } catch (err) {
          console.error('处理链接失败：', link, err);
          failed.push(link);
          ElMessage.error(`第 ${index} 个失败`);
        }
      }
    } finally {
      // 无论成功或抛错都确保清理状态
      globalLoading.value = false;
      newLink.value = '';
      newLinkRemark.value = '';
      newLinkPrice.value = '';
    }
  
    if (failed.length) ElMessage.warning(`部分失败：${failed.length} 个`);
    else ElMessage.success('全部完成');
  };
  

  // 删除
  const removeLink = async (link) => {
    try {
      await ElMessageBox.confirm('确定删除该链接？', '提示', {
        type: 'warning'
      });

      await deleteRecord(link);
      await loadLinksFromDB();
      ElMessage.success("删除成功");
    } catch (err) { }
  };

  // 清空
  const clearLinks = async () => {
    try {
      await ElMessageBox.confirm('确定清空所有链接？', '提示', {
        type: 'warning'
      });

      await clearAllRecords();
      await loadLinksFromDB();
      ElMessage.success("已清空");
    } catch { }
  };
  //删除当前筛选的所有结果
  const deleteFilteredResults = async () => {
    const list = filteredLinks.value || [];

    if (!list.length) {
      ElMessage.info('当前没有筛选结果可删除');
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定删除当前筛选到的 ${list.length} 条记录？此操作不可恢复。`,
        '删除确认',
        { type: 'warning' }
      );
    } catch (err) {
      // 用户取消
      return;
    }

    globalLoading.value = true;
    updateProgress.value = `正在删除 0/${list.length}`;
    const failed = [];

    let idx = 0;
    for (const item of list) {
      idx++;
      updateProgress.value = `正在删除 ${idx}/${list.length}`;
      try {
        await deleteRecord(item.link);
      } catch (err) {
        console.error('删除失败：', item.link, err);
        failed.push(item.link);
      }
    }

    // 刷新数据
    await loadLinksFromDB();
    globalLoading.value = false;
    updateProgress.value = '';
    currentPage.value = 1;

    if (failed.length) {
      ElMessage.warning(`删除完成，但 ${failed.length} 条失败`);
    } else {
      ElMessage.success('删除完成');
    }
  };
  // 刷新
  const refreshLink = async (link) => {
    const item = zangbaoLinks.value.find(i => i.link === link);
    if (!item) return;

    item.loading = true;

    try {
      const record = await getRecord(link);
      if (!record) return;

      const processed = await fetchAccountData(link, null);
      record.data = processed;
      await saveRecord(record);

      await loadLinksFromDB();

      ElMessage.success("刷新成功");
    } catch {
      ElMessage.error("刷新失败");
    } finally {
      item.loading = false;
    }
  };

  // 更新全部
  const updateAll = async () => {
    const total = zangbaoLinks.value.length;
    if (!total) return ElMessage.info("没有链接");

    globalLoading.value = true;
    let index = 0;

    for (const item of zangbaoLinks.value) {
      index++;
      updateProgress.value = `正在更新 ${index}/${total}`;

      const record = await getRecord(item.link);
      if (!record) continue;

      try {
        const processed = await fetchAccountData(item.link, record);
        record.data = processed;
        // record.timestamp = Date.now();
        await saveRecord(record);
      } catch (err) { }
    }

    await loadLinksFromDB();
    globalLoading.value = false;
    updateProgress.value = '';
    ElMessage.success("全部更新完成");
  };

  // 收藏
  const toggleFavorite = async (item) => {
    const record = await getRecord(item.link);
    if (!record) return;

    record.isFavorite = !record.isFavorite;
    await saveRecord(record);

    await loadLinksFromDB();
  };

  const setStatusFilter = (value) => {
    statusFilter.value = value
    currentPage.value = 1
  }

  const setSort = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
    currentPage.value = 1;
  };

  const toggleFilter = () => {
    filterFavorites.value = !filterFavorites.value;
    currentPage.value = 1;
  };

  const applyPriceFilter = () => {
    const min = minPriceInput.value.trim();
    const max = maxPriceInput.value.trim();

    if (min !== '' && isNaN(Number(min))) return ElMessage.warning("最低价无效");
    if (max !== '' && isNaN(Number(max))) return ElMessage.warning("最高价无效");

    minPriceFilter.value = min;
    maxPriceFilter.value = max;
    currentPage.value = 1;
  };

  const clearPriceFilter = () => {
    minPriceInput.value = '';
    maxPriceInput.value = '';
    minPriceFilter.value = '';
    maxPriceFilter.value = '';
    currentPage.value = 1;
  };

  const filteredLinks = computed(() => {
    let list = zangbaoLinks.value;

    if (filterFavorites.value) {
      list = list.filter(i => i.isFavorite);
    }

    const min = minPriceFilter.value === '' ? -Infinity : parseFloat(minPriceFilter.value);
    const max = maxPriceFilter.value === '' ? Infinity : parseFloat(maxPriceFilter.value);

    list = list.filter(i => {
      const field = priceFilterType.value === 'equipPrice'
        ? i.equipPrice
        : i.estimatedPrice;

      const price = field || 0;
      return price >= min && price <= max;
    });

    if (statusFilter.value) {
      list = list.filter(i => i.statusDesc === statusFilter.value);
    }

    const key = sortKey.value;
    const order = sortOrder.value;

    return [...list].sort((a, b) => {
      let A, B;
    
      if (key === 'price') {
        A = a.equipPrice || 0;
        B = b.equipPrice || 0;
      } else if (key === 'estimatedPrice') {
        A = a.estimatedPrice || 0;
        B = b.estimatedPrice || 0;
      } else if (key === 'ratio') {
        // ☆ 新增：预估价值 / 价格 的比例排序
        const aPrice = a.equipPrice || 1;
        const bPrice = b.equipPrice || 1;
        const aEst = a.estimatedPrice || 0;
        const bEst = b.estimatedPrice || 0;
    
        A = aEst / aPrice;
        B = bEst / bPrice;
      } else {
        A = a.timestamp;
        B = b.timestamp;
      }
    
      return order === 'asc' ? A - B : B - A;
    });
  });

  const pagedLinks = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredLinks.value.slice(start, start + pageSize.value);
  });

  return {
    // 状态
    zangbaoLinks,
    newLink,
    newLinkRemark,
    showRemarkInput,
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

    // 方法
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
    deleteFilteredResults
  };
};
