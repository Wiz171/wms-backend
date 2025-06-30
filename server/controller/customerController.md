# Customer Controller (`customerController.js`)

This file manages all customer-related API logic for the warehouse management system backend. It provides endpoints for creating, reading, updating, and deleting customers, and logs actions for auditing.

---

## Line-by-Line Explanation

```js
const Customer = require('../model/customer');
const { logAction } = require('../utils/logAction');
```
- Imports the Customer Mongoose model and a logging utility for audit trails.

---

### Create a New Customer
```js
exports.create = async (req, res) => {
    try {
        const customerData = req.body;
        if (req.user && req.user._id) {
            customerData.createdBy = req.user._id;
        }
        // Check for existing customer by email
        const existing = await Customer.findOne({ email: customerData.email });
        if (existing) {
            return res.status(409).json({ message: 'Customer with this email already exists', customer: existing });
        }
        const customer = new Customer(customerData);
        await customer.save();
        // Log action
        await logAction({
          action: 'create',
          entity: 'customer',
          entityId: customer._id,
          user: req.user,
          details: { email: customer.email, name: customer.name }
        });
        res.status(201).json({ message: 'Customer created', customer });
    } catch (err) {
        res.status(500).send('Error creating customer: ' + err.message);
    }
};
```
- Receives customer data from the request body.
- Optionally attaches the creator's user ID.
- Checks for duplicate email.
- Creates and saves a new customer.
- Logs the creation action.
- Returns the new customer or an error.

---

### Find All Customers
```js
exports.find = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).send('Error fetching customers: ' + err.message);
    }
};
```
- Fetches all customers from the database.
- Returns the list or an error.

---

### Update a Customer
```js
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const customer = await Customer.findByIdAndUpdate(id, update, { new: true });
        if (!customer) return res.status(404).send('Customer not found');
        // Log action
        await logAction({
          action: 'update',
          entity: 'customer',
          entityId: customer._id,
          user: req.user,
          details: { updatedFields: Object.keys(update) }
        });
        res.json({ message: 'Customer updated', customer });
    } catch (err) {
        res.status(500).send('Error updating customer: ' + err.message);
    }
};
```
- Gets the customer ID and update data.
- Updates the customer in the database.
- Logs the update action.
- Returns the updated customer or an error.

---

### Delete a Customer
```js
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) return res.status(404).send('Customer not found');
        // Log action
        await logAction({
          action: 'delete',
          entity: 'customer',
          entityId: id,
          user: req.user,
          details: { email: customer.email, name: customer.name }
        });
        res.json({ message: 'Customer deleted', customer });
    } catch (err) {
        res.status(500).send('Error deleting customer: ' + err.message);
    }
};
```
- Gets the customer ID from the request.
- Deletes the customer from the database.
- Logs the deletion action.
- Returns the deleted customer or an error.

---

## Summary Table

| Function   | What it does                        | Logs Action? | Returns           |
|------------|-------------------------------------|--------------|-------------------|
| create     | Adds a new customer                 | Yes          | New customer/info |
| find       | Lists all customers                 | No           | Array of customers|
| update     | Updates customer by ID              | Yes          | Updated customer  |
| delete     | Deletes customer by ID              | Yes          | Deleted customer  |

---

## Notes
- All functions use `try/catch` for error handling.
- Logging is performed for create, update, and delete actions for auditability.
- RBAC and validation are handled by middleware before these functions are called.
