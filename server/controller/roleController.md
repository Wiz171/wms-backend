# Role Controller (`roleController.js`)

This controller manages user roles and permissions (RBAC) for the warehouse management system backend. It provides endpoints for creating, deleting, and assigning roles and permissions.

---

## Line-by-Line Explanation

```js
const RolePermission = require('../model/rolePermission');
const User = require('../model/model');
```
- Imports the RolePermission and User Mongoose models.

---

### createRole
```js
async function createRole(req, res) {
  try {
    const { role, permissions } = req.body;
    if (!role || !permissions) {
      return res.status(400).json({ message: 'Role and permissions are required' });
    }
    const existing = await RolePermission.findOne({ role });
    if (existing) {
      return res.status(409).json({ message: 'Role already exists' });
    }
    const newRole = new RolePermission({ role, permissions });
    await newRole.save();
    res.status(201).json({ message: 'Role created', role: newRole });
  } catch (err) {
    res.status(500).json({ message: 'Error creating role', error: err.message });
  }
}
```
- Validates required fields.
- Checks for duplicate role.
- Creates and saves a new role with permissions.
- Returns the new role or an error.

---

### deleteRole
```js
async function deleteRole(req, res) {
  try {
    const { role } = req.params;
    const deleted = await RolePermission.findOneAndDelete({ role });
    if (!deleted) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Role deleted', role });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting role', error: err.message });
  }
}
```
- Deletes a role by name.
- Returns the deleted role or an error.

---

### assignRole
```js
async function assignRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role assigned', user });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning role', error: err.message });
  }
}
```
- Assigns a role to a user by user ID.
- Returns the updated user or an error.

---

### assignPermissions
```js
async function assignPermissions(req, res) {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    if (!permissions) return res.status(400).json({ message: 'Permissions are required' });
    const updated = await RolePermission.findOneAndUpdate({ role }, { permissions }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Role not found' });
    res.json({ message: 'Permissions assigned', role: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning permissions', error: err.message });
  }
}
```
- Assigns permissions to a role.
- Returns the updated role or an error.

---

### listRoles
```js
async function listRoles(req, res) {
  try {
    const roles = await RolePermission.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles', error: err.message });
  }
}
```
- Returns all roles and their permissions.
- Returns an error if something goes wrong.

---

## Exported Functions
- `createRole`: Creates a new role.
- `deleteRole`: Deletes a role.
- `assignRole`: Assigns a role to a user.
- `assignPermissions`: Assigns permissions to a role.
- `listRoles`: Lists all roles and permissions.

---

## Summary Table
| Function         | What it does                        | Returns           |
|------------------|-------------------------------------|-------------------|
| createRole       | Creates a new role                  | New role          |
| deleteRole       | Deletes a role                      | Deleted role      |
| assignRole       | Assigns a role to a user            | Updated user      |
| assignPermissions| Assigns permissions to a role       | Updated role      |
| listRoles        | Lists all roles and permissions     | Array of roles    |

---

## Notes
- All functions use `try/catch` for error handling.
- RBAC and validation are handled by middleware before these functions are called.
