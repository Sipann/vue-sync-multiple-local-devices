const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const DB = require('./mongoDB.js');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

// fetch info re. registered devices.
app.get('/admin', (req, res) => {
  DB.getDevicesList()
  .then(response => { res.send(response); });
});

// add new device to list of registered devices.
app.put('/trackDevices', (req, res) => {
  let newList = req.body;
  DB.putDevicesList(newList)
    .then(response => { res.send(response); });
});

// fetch collection of items that target device (currently syncing) should add
app.get('/changesAdded/:target', (req, res) => {
  let { target } = req.params;
  DB.fetchChanges(target, 'add')
    .then(response => { res.send(response);  });
});

// fetch collection of items that target device should/could delete
app.get('/changesDeleted/:target', (req, res) => {
  let { target } = req.params;
  DB.fetchChanges(target, 'del')
    .then(response => { res.send(response); });
});

// fetch collection of items that target should/could update
app.get('/changesUpdated/:target', (req, res) => {
  let { target } = req.params;
  DB.fetchChanges(target, 'upd')
    .then(response => { res.send(response); });
});

// update remote DB with locally added data.
app.post('/changesAdded', (req, res) => {
  let { devicesList, currentDevice, data } = req.body;
  DB.syncRemote(devicesList, currentDevice, 'add', data)
    .then(response => { res.send(response); });
});

// update remote DB with locally deleted data.
app.delete('/deletesAdded', (req, res) => {
  let { devicesList, currentDevice, data } = req.body;
  DB.syncRemote(devicesList, currentDevice, 'del', data)
    .then(response => { res.send(response); });
});

// update remote DB with locally updated data.
app.put('/updatesAdded', (req, res) => {
  let { devicesList, currentDevice, data } = req.body;
  DB.syncRemote(devicesList, currentDevice, 'upd', data)
    .then(response => { res.send(response); });
});


app.listen(process.env.PORT || 8081);


// Previous
// app.get('/changesAdded/:target', (req, res) => {
//   let { target } = req.params;
//   DB.fetchChangesAdded(target)
//     .then(response => {
//       console.log('response', response);
//       res.send(response); 
//     });
// });



// app.get('/changesDeleted/:target', (req, res) => {
//   let { target } = req.params;
//   DB.fetchChangesDeleted(target)
//     .then(response => {
//       console.log('response', response);
//       res.send(response);
//     });
// });



// app.get('/changesUpdated/:target', (req, res) => {
//   let { target } = req.params;
//   DB.fetchChangesUpdated(target)
//     .then(response => {
//       console.log('response', response);
//       res.send(response);
//     });
// });


// app.get('/getDevices', (req, res) => {
//   const result = DB.getDevicesList();
//   console.log('result from /getDevices', result);
//   res.send(result);
// });

// app.post('/addItem', (req, res) => {
//   let item = req.body;
//   const result = DB.writeData(item);
//   res.send(result);
// });

// app.delete('/deleteItem', (req, res) => {
//   let item = req.body;
//   console.log('item', item); 
//   const result = DB.deleteData(item);
//   console.log('result from server', result);
//   res.send(result);
// });

// app.put('/updateItem', (req, res) => {
//   let item = req.body;
//   console.log('item', item);
//   const result = DB.updateDataSameId(item);
//   console.log('result from server', result);
//   res.send(result);
// });