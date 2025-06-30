# purchaseOrder.js Documentation

This file defines the Mongoose schema and model for purchase orders in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
const purchaseOrderSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    notes: String
}, { strict: false });
```
- Defines the schema for a purchase order:
  - `items`: Array of products in the purchase order, each with:
    - `product`: Reference to a Product document (required).
    - `quantity`: Number of units ordered (required, min 1).
  - `createdBy`: Reference to the User who created the purchase order (required).
  - `date`: Date the purchase order was created (defaults to now).
  - `deliveryDate`: Required delivery date for the order.
  - `notes`: Optional notes field.
- The `{ strict: false }` option allows saving additional fields not defined in the schema.

```js
const PurchaseOrder = mongoose.model('PurchaseOrders', purchaseOrderSchema);
```
- Creates the Mongoose model for purchase orders.

```js
module.exports = PurchaseOrder;
```
- Exports the PurchaseOrder model for use in other files.
