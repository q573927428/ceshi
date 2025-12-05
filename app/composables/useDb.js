// composables/useDb.js
import { openDB } from 'idb';

let dbPromise = null;

export const useDb = () => {
  const initDb = async () => {
    if (dbPromise) return dbPromise;

    dbPromise = openDB('zangbaoDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('records')) {
          db.createObjectStore('records', { keyPath: 'link' });
        }
      },
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
