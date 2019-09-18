import { writeLocalData, deleteLocalData, updateLocalDataSameId, getLocalData } from './localDb.js';
import configDbs from './config/configDbs';
import uuidv1 from 'uuid/v1';

// TBU FOR ALL => HANDLE ERROR IN CATCH BLOCK

export const deleteData = async (key) => {
  try {
    let target = await getLocalData(configDbs.local.mainStore, key);
    // delete data on local DB (indexedDB)
    await deleteLocalData(configDbs.local.mainStore, key);

    // store data for syncing with remote DB
    // check if data still waiting to be synced in either the addStore
    const addedQueue = await getLocalData(configDbs.local.addStore, key);
    const updatedQueue = await getLocalData(configDbs.local.updateStore, key);
    let recent = false;

    if (addedQueue !== undefined) {
      recent = true;
      await deleteLocalData(configDbs.local.addStore, key);
    }
    if (updatedQueue !== undefined) {
      recent = true;
      await deleteLocalData(configDbs.local.updateStore, key);
    }
    if (!recent) {
      const ts = Date.now();
      await writeLocalData(configDbs.local.deleteStore, { ...target, ts: ts });
    }

  } catch (e) {
    console.log('e', e);
  }
};

// TBU => make it idempotent => if no update possible (no data on indexedDB => write it);
export const updateDataSameId = async (key, data) => {
  try {
    const ts = Date.now();
    const value = { ts, ...data };
    // update data on localDB (indexedDB)
    await updateLocalDataSameId(configDbs.local.mainStore, key, value);

    // store data for syncing with remote DB
    // check if data still waiting to be synced in either the addStore or the updateStore
    const addedQueue = await getLocalData(configDbs.local.addStore, key);
    const updatedQueue = await getLocalData(configDbs.local.updateStore, key);
    let recent = false;
    
    if (addedQueue !== undefined) {
      recent = true;
      await updateLocalDataSameId(configDbs.local.addStore, key, { id: key, ...value }); // store, key, data
    }
    if (updatedQueue !== undefined) {
      recent = true;
      await updateLocalDataSameId(configDbs.local.updateStore, key, { id: key, ...value });
    }
    if (!recent) {
      await writeLocalData(configDbs.local.updateStore, { id: key, ...value });
    }

  } catch (e) {
    console.log('e', e);
  }
};

export const writeData = async (data) => {
  try {
    const id = uuidv1();
    const ts = Date.now();
    const value = { id, ts, ...data };
    // store data on local DB (indexedDB)
    await writeLocalData(configDbs.local.mainStore, value);

    // store data for syncing with remote DB
    await writeLocalData(configDbs.local.addStore, value);
  } catch (e) {
    console.log('e', e);
  }
};
