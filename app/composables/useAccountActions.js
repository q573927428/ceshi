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

  const updateProgress = ref('');

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
      remark: r.remark || ''
    }));

    zangbaoLinks.value.forEach(i => {
      activeTabs[i.link] = activeTabs[i.link] || 'first';
    });
  };

  // 添加
  const addLink = async () => {
    const input = newLink.value.trim();
    if (!input) return ElMessage.warning('请输入链接');

    const links = extractCbgLink(input);
    if (!links.length) return ElMessage.warning('未识别到合法链接');

    globalLoading.value = true;
    const failed = [];
    let index = 0;

    for (const raw of links) {
      index++;
      const link = normalizeLink(raw);

      try {
        let record = await getRecord(link);

        if (record) {
          const processed = await fetchAccountData(link, record);
          record.data = processed;
          record.equipPrice = processed.equipPrice;
          record.timestamp = Date.now();
          await saveRecord(record);
          ElMessage.success(`第 ${index} 个已存在，更新成功`);
        } else {
          const newRecord = {
            link,
            timestamp: Date.now(),
            isFavorite: false,
            data: null,
            remark: newLinkRemark.value.trim() || ''
          };
          const processed = await fetchAccountData(link);
          newRecord.data = processed;
          newRecord.equipPrice = processed.equipPrice;
          await saveRecord(newRecord);
          ElMessage.success(`第 ${index} 个添加成功`);
        }

        await loadLinksFromDB();
      } catch (err) {
        failed.push(link);
        ElMessage.error(`第 ${index} 个失败`);
      }
    }

    globalLoading.value = false;
    newLink.value = "";

    if (failed.length) ElMessage.warning(`部分失败：${failed.length} 个`);
    else ElMessage.success("全部完成");
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
      record.equipPrice = processed.equipPrice;
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
        record.equipPrice = processed.equipPrice;
        record.timestamp = Date.now();
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
      const price = i.equipPrice || 0;
      return price >= min && price <= max;
    });

    const key = sortKey.value;
    const order = sortOrder.value;

    return [...list].sort((a, b) => {
      const A = key === 'price' ? (a.equipPrice || 0) : a.timestamp;
      const B = key === 'price' ? (b.equipPrice || 0) : b.timestamp;
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
    clearPriceFilter
  };
};
