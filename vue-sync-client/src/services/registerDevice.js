import uuidv4 from 'uuid/v4';
import configDbs from './config/configDbs';
import { getLocalData, writeLocalData } from './localDb.js';
import API from './API_Server.js';

export const registerDevice = async () => {
  // check if device is registered
  let current = await getLocalData(configDbs.local.adminStore, 'current');
  if (!current) {
    // set id to device
    const deviceId = uuidv4();
    await writeLocalData(configDbs.local.adminStore, { key: "current", device: deviceId });
    // register device on devices list
    let all = await API.fetchDevices();
    console.log('all', all);
    all.push(deviceId);
    await writeLocalData(configDbs.local.adminStore, { key: 'devices', all });
    await API.trackDevices({ devices: all});

    // Fetch content of remote DB to write it on local DB (indexedDB)
  } else {
    console.log('already registered');
  }
};
