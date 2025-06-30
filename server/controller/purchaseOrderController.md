# Purchase Order Controller (`purchaseOrderController.js`)

This controller manages all purchase order-related API logic for the warehouse management system backend. It provides endpoints for creating, reading, updating, and deleting purchase orders.

---

## Line-by-Line Explanation

```js
const PurchaseOrder = require('../model/purchaseOrder');
```
- Imports the PurchaseOrder Mongoose model.

---

### create
```js
exports.create = async (req, res) => {
    try {
        const orderData = req.body;
        if (req.user && req.user._id) {
            orderData.createdBy = req.user._id;
        }
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        if (!orderData.deliveryDate) {
            return res.status(400).json({ message: 'Delivery date is required' });
        }
        const order = new PurchaseOrder(orderData);
        await order.save();
        res.status(201).json({ message: 'Purchase order created', order });
    } catch (err) {
        res.status(500).send('Error creating purchase order: ' + err.message);
    }
};
```
- Receives purchase order data from the request body.
- Optionally attaches the creator's user ID.
- Validates required fields (`items`, `deliveryDate`).
- Creates and saves a new purchase order.
- Returns the new order or an error.

---

### find
```js
exports.find = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find().populate('items.product').populate('createdBy', '-password');
        res.json(orders);
    } catch (err) {
        res.status(500).send('Error fetching purchase orders: ' + err.message);
    }
};
```
- Fetches all purchase orders from the database.
- Populates product and user references for each order.
- Returns the orders as a JSON array or an error.

---

### update
```js
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const order = await PurchaseOrder.findByIdAndUpdate(id, update, { new: true });
        if (!order) return res.status(404).send('Purchase order not found');
        res.json({ message: 'Purchase order updated', order });
    } catch (err) {
        res.status(500).send('Error updating purchase order: ' + err.message);
    }
};
```
- Gets the purchase order ID and update data.
- Updates the purchase order in the database.
- Returns the updated order or an error.

---

### delete
```js
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findByIdAndDelete(id);
        if (!order) return res.status(404).send('Purchase order not found');
        res.json({ message: 'Purchase order deleted', order });
    } catch (err) {
        res.status(500).send('Error deleting purchase order: ' + err.message);
    }
};
```
- Gets the purchase order ID from the request.
- Deletes the purchase order from the database.
- Returns the deleted order or an error.

---

## Exported Functions
- `create`: Creates a new purchase order.
- `find`: Returns all purchase orders with populated references.
- `update`: Updates a purchase order.
- `delete`: Deletes a purchase order.

---

## Summary Table
| Function   | What it does                        | Returns           |
|------------|-------------------------------------|-------------------|
| create     | Adds a new purchase order           | New order/info    |
| find       | Lists all purchase orders           | Array of orders   |
| update     | Updates purchase order by ID        | Updated order     |
| delete     | Deletes purchase order by ID        | Deleted order     |

---

## Notes
- All functions use `try/catch` for error handling.
- Validation and RBAC are handled by middleware before these functions are called.
