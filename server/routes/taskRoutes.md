# taskRoutes.js Documentation

This file defines Express routes for managing tasks, protected by JWT authentication.

---

```js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const taskController = require('../controller/taskController');
```
- Imports Express, creates a router, imports JWT auth middleware, and the task controller.

```js
// All routes protected by JWT auth
router.post('/tasks', verifyToken, ...taskController.createTask);
router.get('/tasks/:id', verifyToken, ...taskController.getTask);
router.put('/tasks/:id', verifyToken, ...taskController.updateTask);
router.delete('/tasks/:id', verifyToken, ...taskController.deleteTask);
router.get('/purchase-orders/:purchaseOrderId/tasks', verifyToken, ...taskController.getTasksByPurchaseOrder);
```
- Defines routes for task CRUD operations and fetching tasks by purchase order.
- All routes require a valid JWT token.

```js
module.exports = router;
```
- Exports the router for use in the main app.
