# order.js Documentation

This file defines the Mongoose schema and model for orders in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    total: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expectedDeliveryDate: { type: Date }
}, { timestamps: true });
```
- Defines the schema for an order:
  - `customerName`: Name of the customer (required).
  - `items`: Array of products in the order, each with:
    - `productId`: Reference to a Product document (required).
    - `quantity`: Number of units ordered (required, min 1).
    - `price`: Price per unit (required, min 0).
  - `total`: Total price for the order (required, min 0).
  - `orderDate`: Date the order was placed (defaults to now).
  - `status`: Order status, must be one of 'pending', 'completed', or 'cancelled' (defaults to 'pending').
  - `createdBy`: Reference to the User who created the order (required).
  - `expectedDeliveryDate`: Optional expected delivery date.
- The `{ timestamps: true }` option automatically adds `createdAt` and `updatedAt` fields.

```js
const Order = mongoose.model('Order', orderSchema);
```
- Creates the Mongoose model for orders.

```js
module.exports = Order;
```
- Exports the Order model for use in other files.
