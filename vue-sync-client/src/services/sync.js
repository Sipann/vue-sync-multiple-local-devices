import configDbs from './config/configDbs.js';
import { dbPromise, deleteLocalData, getLocalData, writeLocalData, updateLocalDataSameId, updateLocalData } from './localDb.js';
import API from './API_Server.js';

export const syncRemoteData = async () => {

  const db = await dbPromise;

  const devicesList = await API.fetchDevices(); 
  await updateLocalData(configDbs.local.adminStore, 'devices', { key: 'devices', all: devicesList });

  const current = await getLocalData(configDbs.local.adminStore, 'current');
  const currentDevice = current.device;

  // 1. Fetch data from remote DB
  
  // 1.a. Fetch data to add from remote => update local DB (indexedDB)
  // All items tagged as "added" on remote must be added to local DB.
  const fetchedAdded = await API.fetchAddedItems(currentDevice);
  while (!!fetchedAdded.length) {
    await writeLocalData(configDbs.local.mainStore, fetchedAdded[fetchedAdded.length - 1]);
    fetchedAdded.pop();
  }

  // 1.b. Fetch data to delete from remote => update local DB (indexedDB)
  const fetchedDeleted = await API.fetchDeletedItems(currentDevice);
  while (!!fetchedDeleted.length) {
    // compare deleted item from remote with item available on local
    const id = fetchedDeleted[fetchedDeleted.length - 1].id;
    const tsRemote = fetchedDeleted[fetchedDeleted.length - 1].ts;
    let itemOnLocal = await getLocalData(configDbs.local.mainStore, id);

    if (!!itemOnLocal && itemOnLocal.ts < tsRemote) {
      await deleteLocalData(configDbs.local.mainStore, id);
      // check if item is in peripheric store - updateStore
      const updatedQueue = await getLocalData(configDbs.local.updateStore, id);
      if (updatedQueue !== undefined) {
        await deleteLocalData(configDbs.local.updateStore, id);
      }
    } else {
      // check if item is in peripheric store - deleteStore (if item has also been deleted on local)
      const deletedQueue = await getLocalData(configDbs.local.deleteStore, id);
      if (deletedQueue !== undefined) {
        await deleteLocalData(configDbs.local.deleteStore, id);
      }
    } 
    fetchedDeleted.pop();
  }

  // 1.c. Fetch data to update from remote => update local DB (indexedDB)
  const fetchedUpdated = await API.fetchUpdatedItems(currentDevice);
  while (!!fetchedUpdated.length) {
    const id = fetchedUpdated[fetchedUpdated.length - 1].id;
    const tsRemote = fetchedUpdated[fetchedUpdated.length - 1].ts;
    const itemOnLocal = await getLocalData(configDbs.local.mainStore, id);
    const itemOnDeleted = await getLocalData(configDbs.local.deleteStore, id);
    
    if (!!itemOnLocal && itemOnLocal.ts < tsRemote) {
      await updateLocalDataSameId(configDbs.local.mainStore, id, fetchedUpdated[fetchedUpdated.length - 1]);
      const itemOnUpdated = await getLocalData(configDbs.local.updateStore, id);
      if (itemOnUpdated !== undefined) {
        await deleteLocalData(configDbs.local.updateStore, id);
      }
    }
    if (!!itemOnDeleted && itemOnDeleted.ts < tsRemote) {
      await deleteLocalData(configDbs.local.deleteStore, id);
    }
    fetchedUpdated.pop();
  }


  // 2. Send info re. changes made on local DB (indexedDB) to remote DB

  // TBU => handle catch error
  // DRY - Send all items from peripheric store to remote DB
  async function sendToRemote (storeName, cb) {
    console.log('devicesList', devicesList);  
    console.log('currentDevice', currentDevice);
    let cursor = await db.transaction(storeName).store.openCursor();
    while (cursor) {
      let item = cursor.value;
      cb(devicesList, currentDevice, item)
        .then(res => {
          if (res.ok) { deleteLocalData(storeName, item.id); }
          else { throw new Error(`Could not sync items from ${storeName}`); }
        }).catch (e => {
          console.log(e.stack);
        });
      cursor = await cursor.continue();
    }
  }

  // 2.a. Send all items locally added to remote DB.
  await sendToRemote(configDbs.local.addStore, API.syncRemoteAdded)
  // 2.b. Send all items locally deleted to remote DB.
  await sendToRemote(configDbs.local.deleteStore, API.syncRemoteDeleted);
  // 2.c. Send all items locally updated to remote DB.
  await sendToRemote(configDbs.local.updateStore, API.syncRemoteUpdated);

}