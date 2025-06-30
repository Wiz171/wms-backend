# Order Controller (`orderController.js`)

This controller manages all order-related API logic for the warehouse management system backend. It provides endpoints for creating, reading, updating, and deleting orders, and logs actions for auditing.

---

## Line-by-Line Explanation

```js
const express = require('express');
const Order = require('../model/order');
const mongoose = require('mongoose');
const { logAction } = require('../utils/logAction');
```
- Imports Express (not strictly needed here), the Order Mongoose model, Mongoose for ID validation, and a logging utility.

---

### getOrders
```js
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.productId')
            .populate('createdBy', '-password');
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders: ' + err.message });
    }
};
```
- Fetches all orders from the database.
- Populates product and user references for each order.
- Returns the orders as a JSON array or an error.

---

### createOrder
```js
const createOrder = async (req, res) => {
    try {
        const { customerName, items, total, expectedDeliveryDate } = req.body;
        // Validates required fields
        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }
        if (!total || isNaN(total) || total <= 0) {
            return res.status(400).json({ message: 'Valid total amount is required' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        // Validates and transforms items
        const validatedItems = items.map(item => {
            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                throw new Error(`Invalid product ID: ${item.productId}`);
            }
            if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                throw new Error(`Invalid quantity for product: ${item.productId}`);
            }
            if (!item.price || isNaN(item.price) || item.price < 0) {
                throw new Error(`Invalid price for product: ${item.productId}`);
            }
            return {
                productId: new mongoose.Types.ObjectId(item.productId),
                quantity: Number(item.quantity),
                price: Number(item.price)
            };
        });
        const orderData = {
            customerName,
            items: validatedItems,
            total: Number(total),
            createdBy: req.user._id,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined
        };
        const order = new Order(orderData);
        await order.save();
        // Log action
        await logAction({
          action: 'create',
          entity: 'order',
          entityId: order._id,
          user: req.user,
          details: { customerName, total }
        });
        // Populate references after saving
        const populatedOrder = await Order.findById(order._id)
            .populate('items.productId')
            .populate('createdBy', '-password');
        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error('Error creating order:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ message: 'Error creating order: ' + err.message });
    }
};
```
- Validates required fields and item structure.
- Creates and saves a new order.
- Logs the creation action.
- Populates references and returns the new order or an error.

---

### updateOrder
```js
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndUpdate(id, req.body, { new: true })
            .populate('items.productId')
            .populate('createdBy', '-password');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Log action
        await logAction({
          action: 'update',
          entity: 'order',
          entityId: order._id,
          user: req.user,
          details: { updatedFields: Object.keys(req.body) }
        });
        res.json(order);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Error updating order: ' + err.message });
    }
};
```
- Updates an order by ID with new data.
- Populates references.
- Logs the update action.
- Returns the updated order or an error.

---

### deleteOrder
```js
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Log action
        await logAction({
          action: 'delete',
          entity: 'order',
          entityId: id,
          user: req.user,
          details: { customerName: order.customerName, total: order.total }
        });
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Error deleting order: ' + err.message });
    }
};
```
- Deletes an order by ID.
- Logs the deletion action.
- Returns a 204 No Content response or an error.

---

## Exported Functions
- `getOrders`: Returns all orders with populated references.
- `createOrder`: Creates a new order and logs the action.
- `updateOrder`: Updates an order and logs the action.
- `deleteOrder`: Deletes an order and logs the action.

---

## Summary Table
| Function      | What it does                        | Returns           |
|---------------|-------------------------------------|-------------------|
| getOrders     | Returns all orders                  | Array of orders   |
| createOrder   | Creates a new order                 | New order         |
| updateOrder   | Updates an order by ID              | Updated order     |
| deleteOrder   | Deletes an order by ID              | No content (204)  |

---

## Notes
- All functions use `try/catch` for error handling.
- Logging is performed for create, update, and delete actions for auditability.
- Validation and RBAC are handled by middleware before these functions are called.
