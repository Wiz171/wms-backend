# customer.js Documentation

This file defines the Mongoose schema and model for customers in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
const customerSchema = new mongoose.Schema({}, { strict: false });
```
- Defines a schema for customers with no fixed fields.
- The `{ strict: false }` option allows any fields to be saved dynamically, making the schema flexible.

```js
const Customer = mongoose.model('Customers', customerSchema);
```
- Creates the Mongoose model for customers.

```js
module.exports = Customer;
```
- Exports the Customer model for use in other files.
