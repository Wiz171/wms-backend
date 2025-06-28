const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const orderActionsController = require('../controller/orderActionsController');
const { checkPermission } = require('../middleware/auth');
const logOrderStatusChange = require('../middleware/orderStatusLogger');

// Apply auth middleware to all routes
router.use(checkPermission(['admin', 'manager', 'user']));

// Existing order routes
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

// New order action routes
router.post(
  '/:id/accept',
  checkPermission(['admin', 'manager']), // Only admins and managers can accept orders
  logOrderStatusChange,
  orderActionsController.acceptOrder
);

router.post(
  '/:id/reject',
  checkPermission(['admin', 'manager']), // Only admins and managers can reject orders
  logOrderStatusChange,
  orderActionsController.rejectOrder
);

router.post(
  '/:id/switch-to-do',
  checkPermission(['admin', 'manager']), // Only admins and managers can convert to DO
  orderActionsController.switchToDeliveryOrder
);

// Delivery order status update
router.post(
  '/delivery/:id/status',
  checkPermission(['admin', 'manager', 'user']), // Users can update delivery status
  orderActionsController.updateDeliveryStatus
);

// Get delivery order details
router.get(
  '/:id/delivery-order',
  checkPermission(['admin', 'manager', 'user']),
  orderActionsController.getDeliveryOrder
);

// Get order status history
router.get(
  '/:id/history',
  checkPermission(['admin', 'manager', 'user']),
  orderActionsController.getOrderStatusHistory
);

module.exports = router;
