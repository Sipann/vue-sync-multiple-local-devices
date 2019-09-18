const MongoClient = require('mongodb').MongoClient;
const configDb = require('./config/configDb.js');

// fetch changes ('add', 'del', 'upd') for target device on remoteDB
const fetchChanges = async (target, change) => {
  const client = new MongoClient(configDb.url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(configDb.dbName);
    const result = await db.collection(`${configDb.dbName}${change}_${target}`).find({}, { projection: { _id: 0 } }).toArray();
    await db.collection(`${configDb.dbName}${change}_${target}`).drop();
    return result;
  } catch (e) {
    console.log(e.message);
    return [];
  } finally {
    client.close();
  }
};

// fetch list of registered devices on remote DB.
const getDevicesList = async () => {
  const client = new MongoClient(configDb.url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(configDb.dbName);
    const result = await db.collection(`${configDb.dbName}list`).find({ "key": "devices"}, { projection: { _id: 0, all: 1 } }).toArray();
    const devicesList = result[0].all.devices;
    return devicesList;
  } catch (e) {
    console.log(e.message);
    return [];
  } finally {
    client.close();
  }
};

// Add new device to the list of registered devices.
const putDevicesList = async (devicesList) => {
  const client = new MongoClient(configDb.url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(configDb.dbName);
    const result = await db.collection(`${configDb.dbName}list`).findOneAndReplace({ 'key': 'devices'}, { 'key': 'devices', 'all': devicesList }, { upsert: true });
    return result;
  } catch (e) {
    console.log(e.message);
  } finally {
    client.close();
  }
};


const syncRemote = async (devicesList, currentDevice, change, data) => {
  const client = new MongoClient(configDb.url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(configDb.dbName);
    if (change === 'add') {
      await db.collection(configDb.col).insertOne({ _id: data.id, ...data });
    } else if (change === 'del') {
      await db.collection(configDb.col).deleteOne({ "_id": data.id });
    } else if (change === 'upd') {
      await db.collection(configDb.col).findOneAndUpdate({ "_id": data.id }, {$set: data} )
    } else {
      throw new Error ('change must be "add", "del" or "upd"')
    }
    let list = devicesList.filter(device => device !== currentDevice);
    for (let i = 0; i < list.length; i++) {
      await db.collection(`${configDb.dbName}${change}_${list[i]}`).insertOne({ _id: data.id, ...data });
    }
    return { ok: true };
  } catch (e) {
    console.log('from syncRemote', e.message);
  } finally {
    client.close();
  }
};

module.exports = {
  fetchChanges,
  getDevicesList,
  putDevicesList,
  syncRemote,
}

