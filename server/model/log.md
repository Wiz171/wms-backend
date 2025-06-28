# log.js Documentation

This file defines the Mongoose schema and model for logging actions in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'create', 'update', 'delete'
  entity: { type: String, required: true }, // e.g. 'product', 'customer', 'order', etc.
  entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    email: { type: String },
    role: { type: String }
  },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object, default: {} } // Optional: store extra info
});
```
- Defines the schema for a log entry:
  - `action`: The action performed (required).
  - `entity`: The entity affected (required).
  - `entityId`: Optional reference to the affected entity's ID.
  - `user`: Information about the user who performed the action (required fields: `_id`).
  - `timestamp`: When the action occurred (defaults to now).
  - `details`: Optional object for extra information.

```js
const Log = mongoose.model('Log', logSchema);
```
- Creates the Mongoose model for logs.

```js
module.exports = Log;
```
- Exports the Log model for use in other files.
