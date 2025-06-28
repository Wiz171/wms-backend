# router.js Documentation

This file is the main Express router for the backend API and web routes. It wires up all controllers, middleware, and sub-routers.

---

```js
const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../model/model');
const { generateTokens } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { loginValidation } = require('../middleware/validation');

const services = require('../../services/render');
const controller = require('../controller/controller');
const productController = require('../controller/productController');
const customerController = require('../controller/customerController');
const purchaseOrderController = require('../controller/purchaseOrderController');
const dashboardController = require('../controller/dashboardController');
const taskController = require('../controller/taskController');
const orderController = require('../controller/orderController');
const { verifyToken } = require('../middleware/auth');
const { checkPermission, getUserPermissions, MODULES, ACTIONS } = require('../middleware/rbac');
const { validate, userValidation, productValidation, customerValidation } = require('../middleware/validation');
const { UnauthorizedError } = require('../utils/errors');
const roleController = require('../controller/roleController');
const logController = require('../controller/logController');
const taskRoutes = require('./taskRoutes');
```
- Imports all required modules, controllers, middleware, and sub-routers.

```js
// User Profile routes
const userProfileRouter = require('./userProfile');
route.use('/api/profile', userProfileRouter);
```
- Mounts the user profile sub-router at `/api/profile`.

```js
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
```
- Ensures the JWT secret is set in environment variables and stores it.

```js
route.get('/', services.homeRoutes);
route.get('/add-user', services.add_user);
route.get('/update-user', services.update_user);
```
- Web routes for rendering EJS views.

```js
//api
route.use('/api', verifyToken);
// Apply permission middleware to get user's allowed modules
route.use('/api', getUserPermissions);
```
- All `/api` routes require JWT authentication and attach user permissions.

```js
// Get current user info with permissions (must be before /:id route)
// ...existing code...
```
- Additional API routes and logic are defined below in the file.

---

_The file continues with route definitions for users, products, customers, orders, tasks, roles, logs, and more, using the imported controllers and middleware._
