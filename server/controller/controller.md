# User Controller (`controller.js`)

This file handles all user-related CRUD operations and enforces role-based access control (RBAC) for user management in the warehouse management system backend.

---

## MongoDB Connection Helper
```js
const connectDB = async () => { ... }
```
- Connects to MongoDB using credentials from environment variables.
- Used in scripts, not in route handlers.

---

## Create a New User
```js
exports.create = async (req, res) => { ... }
```
- Extracts `name`, `email`, `gender`, `status`, `role`, and `password` from the request body.
- Validates that `name`, `email`, and `password` are present.
- Creates a new `User` document and saves it to the database.
- Returns the created user or an error message.

---

## Find Users
```js
exports.find = async (req, res) => { ... }
```
- If the requester is a manager, excludes users with the `superadmin` role.
- Returns a list of users (excluding passwords).

---

## Get Single User
```js
exports.getUser = async (req, res) => { ... }
```
- Gets a user by ID from the request parameters.
- If the requester is a manager and the target user is a superadmin, access is denied.
- Returns the user (excluding password) or an error message.

---

## Update User
```js
exports.update = async (req, res) => { ... }
```
- Gets the user ID and update data from the request.
- If the requester is a manager:
  - Cannot edit users with `manager` or `superadmin` roles.
  - Cannot assign the `manager` or `superadmin` role to anyone.
- Updates the user and returns the updated user or an error message.

---

## Delete User
```js
exports.delete = async (req, res) => { ... }
```
- Deletes a user by ID from the request parameters.
- Returns the deleted user or an error message.

---

## Summary
- This controller enforces RBAC for user management.
- All responses are JSON.
- Errors are handled and returned as error messages.
