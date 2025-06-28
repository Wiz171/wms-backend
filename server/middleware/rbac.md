# RBAC Middleware (`rbac.js`)

This file provides role-based access control (RBAC) middleware for the warehouse management system backend, enforcing permissions for different user roles. **All roles and permissions are now fetched from the database (`RolePermission` collection), not hardcoded.**

---

## Line-by-Line Explanation

```js
const { ForbiddenError } = require('../utils/errors');
const RolePermission = require('../model/rolePermission');
```
- Imports error utility and the RolePermission Mongoose model.

---

### Constants
- `ROLES`, `MODULES`, `ACTIONS`: Define role, module, and action constants for use throughout the app.

---

### hasPermissionDb
- Async helper function that checks if a role has permission for an action on a module by querying the database.
- Returns true if the role has the action or `manage` permission for the module.

---

### checkPermission
- Middleware to check if the current user has permission to perform a specific action on a module.
- Always checks the database for up-to-date permissions.
- Calls `next()` if allowed, or returns a 403 Forbidden error if not.

---

### getUserPermissions
- Async middleware to fetch the user's allowed modules and actions from the database.
- Attaches a frontend-friendly permissions object to `res.locals.userPermissions`.

---

### requireSuperAdmin
- Middleware to restrict role/permission editing routes to only users with the `super_admin` role.
- Returns a 403 Forbidden error if the user is not a super admin.

---

## Exported Functions
- `checkPermission`: Enforces RBAC for protected routes using DB permissions.
- `getUserPermissions`: Attaches user permissions from DB to the response.
- `requireSuperAdmin`: Restricts role/permission editing to super_admin only.
- `ROLES`, `MODULES`, `ACTIONS`: Constants for use in route definitions.

---

# RBAC Middleware Documentation

## Overview
This middleware implements Role-Based Access Control (RBAC) for the warehouse management system. It dynamically fetches all roles and permissions from the MongoDB `RolePermission` collection, ensuring that permissions are never hardcoded. Only users with the `super_admin` role can edit roles and permissions.

---

## Key Concepts
- **Roles**: User roles (e.g., `super_admin`, `manager`, `user`) are defined in the database and referenced in the code via the `ROLES` constant.
- **Modules**: Application modules (e.g., `users`, `products`, `orders`) are defined in the `MODULES` constant.
- **Actions**: Supported actions are `create`, `read`, `update`, `delete`, and `manage` (which grants all actions).
- **RolePermission Model**: Stores each role's allowed actions per module in MongoDB.

---

## Main Exports
- `ROLES`, `MODULES`, `ACTIONS`: Constants for use throughout the backend.
- `checkPermission(module, action)`: Middleware to check if the current user's role has the specified permission for a module.
- `getUserPermissions`: Middleware to fetch and expose the current user's allowed modules/actions from the database.
- `requireSuperAdmin`: Middleware to restrict access to role/permission management endpoints to `super_admin` only.

---

## How It Works
1. **Permission Checking**
   - `checkPermission(module, action)` uses `hasPermissionDb` to query the `RolePermission` collection for the user's role.
   - If the role has `manage` for the module, all actions are allowed. Otherwise, the specific action must be present.
   - If the user is not authenticated or lacks permission, a `ForbiddenError` is thrown.

2. **User Permissions for Frontend**
   - `getUserPermissions` fetches the user's role permissions from the database and transforms them into a frontend-friendly format, expanding `manage` to all actions.

3. **Super Admin Restriction**
   - `requireSuperAdmin` ensures only users with the `super_admin` role can access or modify role/permission management endpoints.

---

## Example Usage
```js
const { checkPermission, requireSuperAdmin } = require('./middleware/rbac');

// Protect a route so only users with 'update' permission on 'products' can access
router.put('/products/:id', checkPermission(MODULES.PRODUCTS, ACTIONS.UPDATE), productController.updateProduct);

// Restrict role/permission management to super_admin
router.post('/roles', requireSuperAdmin, roleController.createRole);
```

---

## Database-Driven RBAC Flow
1. All permissions are stored in the `RolePermission` collection in MongoDB.
2. The middleware always queries the database for the latest permissions.
3. No permissions are hardcoded in the backend code.
4. Only `super_admin` can edit roles/permissions (enforced by `requireSuperAdmin`).

---

## Security Notes
- Never hardcode permissions or roles in the codebase.
- Always use the provided middleware to enforce RBAC and super admin restrictions.
- Ensure the `RolePermission` collection is seeded and maintained by a `super_admin` user.

---

## See Also
- [`rolePermission.js`](../model/rolePermission.js): Mongoose model for role permissions.
- [`roleController.js`](../controller/roleController.js): Endpoints for managing roles and permissions.
- [`auth.js`](./auth.js): Authentication middleware.

---

_Last updated: June 24, 2025_
