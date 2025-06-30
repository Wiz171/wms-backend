# rolePermission.js Documentation

This file defines the Mongoose schema and model for storing role-based permissions in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true
  },
  permissions: {
    type: Object, // { module: [actions] }
    required: true
  }
});
```
- Defines the schema for a role's permissions:
  - `role`: The name of the role (e.g., 'super_admin', 'manager', 'user'). Must be unique and is required.
  - `permissions`: An object mapping module names to arrays of allowed actions (e.g., `{ products: ['read', 'update'] }`).

```js
const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);
```
- Creates the Mongoose model for role permissions.

```js
module.exports = RolePermission;
```
- Exports the RolePermission model for use in other files.
