// composables/useDb.js
import { openDB } from 'idb';

let dbPromise = null;

export const useDb = () => {
  const initDb = async () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB('zangbaoDB', 2, {
      upgrade(db) {
        let store;
        if (!db.objectStoreNames.contains('records')) {
          store = db.createObjectStore('records', { keyPath: 'link' });
        } else {
          store = db.transaction.objectStore('records');
        }

        // 索引（简单，可靠）
        if (!store.indexNames.contains('timestamp')) {
          store.createIndex('timestamp', 'timestamp');
        }
        if (!store.indexNames.contains('equipPrice')) {
          store.createIndex('equipPrice', 'equipPrice');
        }
        if (!store.indexNames.contains('isFavorite')) {
          store.createIndex('isFavorite', 'isFavorite');
        }
      }
    });

    return dbPromise;
  };

  const saveRecord = async (record) => {
    const db = await initDb();
    await db.put('records', JSON.parse(JSON.stringify(record)));
  };

  const getRecord = async (link) => {
    const db = await initDb();
    return await db.get('records', link);
  };

  const deleteRecord = async (link) => {
    const db = await initDb();
    await db.delete('records', link);
  };

  const loadAllRecords = async () => {
    const db = await initDb();
    return await db.getAll('records');
  };

  const clearAllRecords = async () => {
    const db = await initDb();
    await db.clear('records');
  };

  return {
    initDb,
    saveRecord,
    getRecord,
    deleteRecord,
    loadAllRecords,
    clearAllRecords
  };
};
