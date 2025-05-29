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

// User Profile routes
const userProfileRouter = require('./userProfile');
route.use('/api/profile', userProfileRouter);

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;

route.get('/', services.homeRoutes);

route.get('/add-user', services.add_user);

route.get('/update-user', services.update_user);

//api
route.use('/api', verifyToken);

// Apply permission middleware to get user's allowed modules
route.use('/api', getUserPermissions);

// Get current user info with permissions (must be before /:id route)
route.get('/api/users/me', verifyToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
  const { password, ...userInfo } = req.user.toObject ? req.user.toObject() : req.user;
  res.json({
    status: 'success',
    data: {
      ...userInfo,
      permissions: res.locals.userPermissions
    }
  });
});

// User routes
route.post('/api/users',
  checkPermission(MODULES.USERS, ACTIONS.CREATE),
  validate(userValidation.create),
  controller.create
);

route.get('/api/users',
  checkPermission(MODULES.USERS, ACTIONS.READ),
  controller.find
);

route.get('/api/users/:id',
  checkPermission(MODULES.USERS, ACTIONS.READ),
  controller.getUser
);

route.put('/api/users/:id',
  checkPermission(MODULES.USERS, ACTIONS.UPDATE),
  validate(userValidation.update),
  controller.update
);

route.patch('/api/users/:id',
  checkPermission(MODULES.USERS, ACTIONS.UPDATE),
  validate(userValidation.update),
  controller.update
);

route.delete('/api/users/:id',
  checkPermission(MODULES.USERS, ACTIONS.DELETE),
  controller.delete
);

// Product routes
route.post('/api/products',
  checkPermission(MODULES.PRODUCTS, ACTIONS.CREATE),
  validate(productValidation.create),
  productController.create
);

route.get('/api/products',
  checkPermission(MODULES.PRODUCTS, ACTIONS.READ),
  productController.find
);

route.put('/api/products/:id',
  checkPermission(MODULES.PRODUCTS, ACTIONS.UPDATE),
  validate(productValidation.update),
  productController.update
);

route.patch('/api/products/:id',
  checkPermission(MODULES.PRODUCTS, ACTIONS.UPDATE),
  validate(productValidation.update),
  productController.update
);

route.delete('/api/products/:id',
  checkPermission(MODULES.PRODUCTS, ACTIONS.DELETE),
  productController.delete
);

// Customer routes
route.post('/api/customers',
  checkPermission(MODULES.CUSTOMERS, ACTIONS.CREATE),
  validate(customerValidation.create),
  customerController.create
);

route.get('/api/customers',
  checkPermission(MODULES.CUSTOMERS, ACTIONS.READ),
  customerController.find
);

route.put('/api/customers/:id',
  checkPermission(MODULES.CUSTOMERS, ACTIONS.UPDATE),
  validate(customerValidation.update),
  customerController.update
);

route.patch('/api/customers/:id',
  checkPermission(MODULES.CUSTOMERS, ACTIONS.UPDATE),
  validate(customerValidation.update),
  customerController.update
);

route.delete('/api/customers/:id',
  checkPermission(MODULES.CUSTOMERS, ACTIONS.DELETE),
  customerController.delete
);

// Purchase Order routes
route.post('/api/purchase-orders',
  checkPermission(MODULES.PURCHASE_ORDERS, ACTIONS.CREATE),
  purchaseOrderController.create
);

route.get('/api/purchase-orders',
  checkPermission(MODULES.PURCHASE_ORDERS, ACTIONS.READ),
  purchaseOrderController.find
);

route.put('/api/purchase-orders/:id',
  checkPermission(MODULES.PURCHASE_ORDERS, ACTIONS.UPDATE),
  purchaseOrderController.update
);

route.patch('/api/purchase-orders/:id',
  checkPermission(MODULES.PURCHASE_ORDERS, ACTIONS.UPDATE),
  purchaseOrderController.update
);

route.delete('/api/purchase-orders/:id',
  checkPermission(MODULES.PURCHASE_ORDERS, ACTIONS.DELETE),
  purchaseOrderController.delete
);

// Dashboard routes
route.get('/api/dashboard/stats',
  checkPermission(MODULES.DASHBOARD, ACTIONS.READ),
  dashboardController.getStats
);

route.get('/api/dashboard/tasks',
  checkPermission(MODULES.DASHBOARD, ACTIONS.READ),
  dashboardController.getTasks
);

route.get('/api/dashboard/stock',
  checkPermission(MODULES.DASHBOARD, ACTIONS.READ),
  dashboardController.getStock
);

// Task routes
route.get('/api/tasks',
  checkPermission(MODULES.TASKS, ACTIONS.READ),
  taskController.getTasks
);

route.post('/api/tasks',
  checkPermission(MODULES.TASKS, ACTIONS.CREATE),
  taskController.createTask
);

route.put('/api/tasks/:id',
  checkPermission(MODULES.TASKS, ACTIONS.UPDATE),
  taskController.updateTask
);

route.patch('/api/tasks/:id',
  checkPermission(MODULES.TASKS, ACTIONS.UPDATE),
  taskController.updateTask
);

route.delete('/api/tasks/:id',
  checkPermission(MODULES.TASKS, ACTIONS.DELETE),
  taskController.deleteTask
);

// Order routes
route.get('/api/orders',
  checkPermission(MODULES.ORDERS, ACTIONS.READ),
  orderController.getOrders
);

route.post('/api/orders',
  checkPermission(MODULES.ORDERS, ACTIONS.CREATE),
  orderController.createOrder
);

route.put('/api/orders/:id',
  checkPermission(MODULES.ORDERS, ACTIONS.UPDATE),
  orderController.updateOrder
);

route.patch('/api/orders/:id',
  checkPermission(MODULES.ORDERS, ACTIONS.UPDATE),
  orderController.updateOrder
);

route.delete('/api/orders/:id',
  checkPermission(MODULES.ORDERS, ACTIONS.DELETE),
  orderController.deleteOrder
);

// Role management routes (superadmin only)
route.post('/api/roles', checkPermission(MODULES.USERS, ACTIONS.MANAGE), roleController.createRole);
route.delete('/api/roles/:role', checkPermission(MODULES.USERS, ACTIONS.MANAGE), roleController.deleteRole);
route.post('/api/roles/:role/permissions', checkPermission(MODULES.USERS, ACTIONS.MANAGE), roleController.assignPermissions);
route.post('/api/users/:id/role', checkPermission(MODULES.USERS, ACTIONS.MANAGE), roleController.assignRole);
route.get('/api/roles', checkPermission(MODULES.USERS, ACTIONS.MANAGE), roleController.listRoles);

// Log API
route.get('/api/logs', logController.getLogs);

// Login route with validation only (rate limiting removed)
route.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[LOGIN] Validation failed:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or password',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('[LOGIN] User lookup:', email, !!user);

    if (!user || !user.isActive) {
      console.log('[LOGIN] User not found or inactive');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    userPassword = await User.findOne({ email}).select('+password');
    if (!userPassword) {
      console.log('[LOGIN] User password not found');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    console.log('[LOGIN] User password found:', userPassword);
    const isPasswordValid = await bcrypt.compare(password, userPassword.password);
    console.log('[LOGIN] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    let tokens;
    try {
      tokens = generateTokens(user);
    } catch (jwtError) {
      console.error('[LOGIN] JWT signing error:', jwtError);
      return res.status(500).json({
        status: 'error',
        message: 'Login failed. Please try again later.'
      });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };

    return res.json({
      status: 'success',
      data: {
        token: tokens.accessToken,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('[LOGIN] Internal error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again later.'
    });
  }
});

module.exports = route;