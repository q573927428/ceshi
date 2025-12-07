import { openDB } from 'idb';

/**
 * 一键导出整个 IndexedDB
 * 自动遍历所有 object store 
 */
export async function exportIndexedDB(dbName = 'zangbao-db') {
  try {
    const db = await openDB(dbName);
    const exportData = {};

    const storeNames = db.objectStoreNames;

    for (const storeName of storeNames) {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      exportData[storeName] = await store.getAll();
      await tx.done;
    }

    const jsonStr = JSON.stringify(exportData, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `${dbName}-backup-${dateStr}.json`;

    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error('导出 IndexedDB 失败:', err);
    return false;
  }
}



/**
 * 一键导入并恢复 IndexedDB 数据
 * 自动写入所有 object store
 */
export async function importIndexedDB(file, dbName = 'zangbao-db') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const db = await openDB(dbName);

        const storeNames = db.objectStoreNames;

        // 遍历所有 store 写入
        for (const storeName of storeNames) {
          if (!json[storeName]) continue;

          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);

          // 清空旧数据
          await store.clear();

          // 写入新数据
          for (const item of json[storeName]) {
            // 自动处理主键（如果有 keyPath）
            await store.put(item);
          }

          await tx.done;
        }

        resolve(true);
      } catch (err) {
        console.error('导入 IndexedDB 失败:', err);
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}
