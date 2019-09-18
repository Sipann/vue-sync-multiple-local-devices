import configDbs from './config/configDbs.js';
import { deleteLocalData } from './localDb.js';

const baseUrl = configDbs.remote.baseUrl;
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}; 

export default {

  // Fetch && Update info re. devices from / on remote DB
  async fetchDevices() {
    const response = await fetch(`${baseUrl}/admin`);
    const body = await response.json();
    return body;
  },

  async trackDevices(data) {
    const response = await fetch(`${baseUrl}/trackDevices`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
    });
    const body = await response.json();
    return body;
  },


  // Fetch info re. items from remote DB
  async fetchAddedItems(currentDevice) {
    const response = await fetch(`${baseUrl}/changesAdded/${currentDevice}`);
    const body = await response.json();
    return body;
  },

  async fetchDeletedItems(currentDevice) {
    const response = await fetch(`${baseUrl}/changesDeleted/${currentDevice}`);
    const body = await response.json();
    return body;
  },

  async fetchUpdatedItems(currentDevice) {
    const response = await fetch(`${baseUrl}/changesUpdated/${currentDevice}`);
    const body = await response.json();
    return body;
  },


  // Update info on remote DB with added, deleted and updated items locally. 
  async syncRemoteAdded(devicesList, currentDevice, data) {
    const response = await fetch(`${baseUrl}/changesAdded`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ devicesList, currentDevice, data }),
    });
    const body = await response.json();
    return body;
  }, 
  
  async syncRemoteDeleted (devicesList, currentDevice, data) {
    const response = await fetch(`${baseUrl}/deletesAdded`, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({ devicesList, currentDevice, data }),
    });
    const body = await response.json();
    return body;
  },

  async syncRemoteUpdated(devicesList, currentDevice, data) {
    const response = await fetch(`${baseUrl}/updatesAdded`, {
      method: 'PUT', 
      headers: headers,
      body: JSON.stringify({ devicesList, currentDevice, data }),
    });
    const body = await response.json();
    return body;
  },

  

}

// async updateRemoteData(data) {
  //   // console.log('data from updateRemoteData', data);
  //   return fetch(`${baseUrl}/updateItem`, {
  //     method: 'PUT',
  //     headers: headers,
  //     body: JSON.stringify(data)
  //   }).then(function(res) {
  //     let response = res;
  //     // console.log('res from updateRemoteData', response);
  //     return response;
  //   });
  // },

    // async deleteRemoteData(data) {
  //   return fetch(`${baseUrl}/deleteItem`, {
  //     method: 'DELETE',
  //     headers: headers,
  //     body: JSON.stringify(data)
  //   }).then(function(res) {
  //     let response = res;
  //     console.log('res from deleteRemoteData', response);
  //     return response;
  //   });
  // },

    // async writeRemoteData(data) {
  //   const response = await fetch(`${baseUrl}/addItem`, {
  //     method: 'POST', 
  //     headers: headers, 
  //     body: JSON.stringify(data)
  //   });
  //   const body = await response.json();
  //   return body;
  // },
  // Check if new above is ok

 // writeRemoteData(data) {
  //   return fetch(`${baseUrl}/addItem`, {
  //     method: 'POST', 
  //     headers: headers, 
  //     body: JSON.stringify(data)
  //   }).then(function(res) {
  //     let response = res;
  //     console.log('res from writeRemoteData', response);
  //     return response;
  //   });
  // },

  // writeSyncingRemote(devicesList, currentDevice, data) {
  //   return fetch(`${baseUrl}/changesAdded`, {
  //     method: 'POST',
  //     headers: headers,
  //     body: JSON.stringify({ devicesList, currentDevice, data }),
  //   }).then(function(res) {
  //     let response = res;
  //     console.log('res from writeSyncingRemote', response);
  //     return response;
  //   });
  // },

  // async updateSyncingRemote(devicesList, currentDevice, data) {
  //   return fetch(`${baseUrl}/updatesAdded`, {
  //     method: 'PUT',
  //     headers: headers,
  //     body: JSON.stringify({ devicesList, currentDevice, data }),
  //   }).then(function(res) {
  //     let response = res;
  //     return response;
  //   });
  // },

  // async deleteSyncingRemote(devicesList, currentDevice, data) {
  //   return fetch(`${baseUrl}/deletesAdded`, {
  //     method: 'DELETE',
  //     headers: headers,
  //     body: JSON.stringify({ devicesList, currentDevice, data }),
  //   }).then(function(res) {
  //     let response = res;
  //     return response;
  //   });
  // },