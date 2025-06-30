# Task Controller (`taskController.js`)

This controller manages all task-related API logic for the warehouse management system backend. It provides endpoints for creating, reading, updating, and deleting tasks.

---

## Line-by-Line Explanation

```js
const express = require('express');
const Task = require('../model/task');
const PurchaseOrder = require('../model/purchaseOrder');
const { body, param, validationResult } = require('express-validator');
```
- Imports Express (not strictly needed here), the Task and PurchaseOrder Mongoose models, and validation utilities.

---

### createTask
```js
exports.createTask = [
  body('purchaseOrderId').isMongoId(),
  body('type').isIn(['Picking', 'Packing', 'Quality Check', 'Shipping']),
  body('assignedTo').isString().notEmpty(),
  body('details').isString().notEmpty(),
  body('deadline').isISO8601(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Check purchase order exists
    const { purchaseOrderId, type, assignedTo, details, deadline, status } = req.body;
    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    const task = new Task({ purchaseOrderId, type, assignedTo, details, deadline, status });
    await task.save();
    res.status(201).json({ message: 'Task created', task });
  }
];
```
- Validates input fields using express-validator.
- Checks that the referenced purchase order exists.
- Creates and saves a new task.
- Returns the new task or an error.

---

### getTasks
```js
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks: ' + err.message });
  }
};
```
- Fetches all tasks from the database.
- Returns the list or an error.

---

### updateTask
```js
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const task = await Task.findByIdAndUpdate(id, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task: ' + err.message });
  }
};
```
- Gets the task ID and update data.
- Updates the task in the database.
- Returns the updated task or an error.

---

### deleteTask
```js
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', task });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task: ' + err.message });
  }
};
```
- Gets the task ID from the request.
- Deletes the task from the database.
- Returns the deleted task or an error.

---

## Exported Functions
- `createTask`: Creates a new task.
- `getTasks`: Returns all tasks.
- `updateTask`: Updates a task.
- `deleteTask`: Deletes a task.

---

## Summary Table
| Function     | What it does                        | Returns           |
|--------------|-------------------------------------|-------------------|
| createTask   | Adds a new task                     | New task/info     |
| getTasks     | Lists all tasks                     | Array of tasks    |
| updateTask   | Updates task by ID                  | Updated task      |
| deleteTask   | Deletes task by ID                  | Deleted task      |

---

## Notes
- All functions use `try/catch` for error handling.
- Validation and RBAC are handled by middleware before these functions are called.
