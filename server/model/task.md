# task.js Documentation

This file defines the Mongoose schema and model for tasks related to purchase orders in the warehouse management system.

---

```js
const mongoose = require('mongoose');
const { Schema } = mongoose;
```
- Imports the Mongoose library and its Schema constructor.

```js
const taskSchema = new Schema({
  purchaseOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  type: {
    type: String,
    enum: ['Picking', 'Packing', 'Quality Check', 'Shipping'],
    required: true
  },
  assignedTo: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```
- Defines the schema for a task:
  - `purchaseOrderId`: Reference to the related PurchaseOrder (required).
  - `type`: Task type, must be one of the specified values (required).
  - `assignedTo`: Name or ID of the person assigned (required).
  - `details`: Task details (required).
  - `status`: Task status, must be one of the specified values (defaults to 'Pending').
  - `deadline`: Task deadline (required).
  - `createdAt`: Creation timestamp (defaults to now).
  - `updatedAt`: Last update timestamp (defaults to now).

```js
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```
- Pre-save hook to update the `updatedAt` field before saving.

```js
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});
```
- Pre-update hook to update the `updatedAt` field before updating.

```js
const Task = mongoose.model('Task', taskSchema);
```
- Creates the Mongoose model for tasks.

```js
module.exports = Task;
```
- Exports the Task model for use in other files.
