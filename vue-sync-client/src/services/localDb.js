import { openDB, deleteDB } from 'idb';
import configDbs from './config/configDbs';

export const dbPromise = openDB(configDbs.local.db, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(configDbs.local.mainStore)) {
      db.createObjectStore(configDbs.local.mainStore, { keyPath: 'id' });
    } 
    if (!db.objectStoreNames.contains(configDbs.local.addStore)) {
      db.createObjectStore(configDbs.local.addStore, { keyPath: 'id' });
    } 
    if (!db.objectStoreNames.contains(configDbs.local.deleteStore)) {
      db.createObjectStore(configDbs.local.deleteStore, { keyPath: 'id' });
    } 
    if (!db.objectStoreNames.contains(configDbs.local.updateStore)) {
      db.createObjectStore(configDbs.local.updateStore, { keyPath: 'id' });
    } 
    if (!db.objectStoreNames.contains(configDbs.local.adminStore)) {
      db.createObjectStore(configDbs.local.adminStore, { keyPath: 'key' });
    }
  }
});

// TBU FOR ALL - HANDLE ERRORS TRY / CATCH

export const deleteLocalDB = async (dbName) => {
  await deleteDB(dbName);
};

export const deleteLocalData = async (st, key) => {
  const db = await dbPromise;
  const result = await db.delete(st, key);
  return result;
};

export const getLocalData = async (st, key) => {
  const db = await dbPromise;
  const result = db.get(st, key);
  return result;
};

export const updateLocalData = async (st, key, data) => {
  const deletion = await deleteLocalData(st, key);
  const addition = await writeLocalData(st, data);
  return { deletion, addition };
};

// TBU => make it idempotent ? => if no update possible (no data on indexedDB => write it);
export const updateLocalDataSameId = async (st, key, data) => {
  const db = await dbPromise;
  const value = { id: key, ...data };
  const result = await db.put(st, value);
  return result;
}

export const writeLocalData = async (st, data) => {
  const db = await dbPromise;
  return await db.add(st, { ...data });
};


// TBU - TO KEEP ?
// export const getLocalStoreData = async (st) => {
//   const db = await dbPromise;
//   let cursor = await db.transaction(st).store.openCursor();
//   while (cursor) {
//     console.log('cursor.value', cursor.value);
//     cursor = await cursor.continue();
//   }
// }