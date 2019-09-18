<template>
  <div>
    <h2>// Admin</h2>
    <button @click="register">Register Device</button>
    <h2>Syncing</h2>
    <button @click="sync">Sync Data</button>
    <h2>Add Word</h2>
    <form @submit.prevent="sendWord">
      <input type="text" name="english" id="english" v-model="english">
      <input type="text" name="french" id="french" v-model="french">
      <button>Send</button>
    </form>
    <h2>Delete Word</h2>
    <form @submit.prevent="deleteWord">
      <input type="text" name="key" id="key" v-model="key">
      <button>Delete</button>
    </form>
    <h2>Update Word</h2>
    <form @submit.prevent="updateWord">
      <input type="text" name="english" id="english-update" v-model="englishUpdate">
      <input type="text" name="french " id="french -update" v-model="frenchUpdate">
      <input type="text" name="key-target " id="key-target" v-model="keyTarget">
      <button>Update</button>
    </form>
  </div>
</template>

<script>
import { writeData, deleteData, updateData, updateDataSameId } from '@/services/writeItems';
import { syncRemoteData } from '@/services/sync.js';
import { registerDevice } from '@/services/registerDevice.js';
import configDbs from '@/services/config/configDbs';

export default {
  data() {
    return {
      english: '',
      englishUpdate: '',
      french: '',
      frenchUpdate: '',
      key: '',
      keyTarget: '',
    };
  },
  methods: {
    deleteWord() {
      // deleteData(parseInt(this.key));
      deleteData(this.key);
    },
    async sendWord() {
      // writeData(configDbs.local.mainStore, { english: this.english, french: this.french });
      await writeData({ english: this.english, french: this.french });
      this.english = this.french = '';
    },
    updateWord() {
      // updateData(parseInt(this.keyTarget), { english: this.englishUpdate, french: this.frenchUpdate });
      updateDataSameId(this.keyTarget, { english: this.englishUpdate, french: this.frenchUpdate });
    },
    sync() {
      syncRemoteData();
    },
    register() {
      registerDevice();
    },
  },
}
</script>