const express = require('express');
const Task = require('../model/task');
const PurchaseOrder = require('../model/purchaseOrder');
const { body, param, validationResult } = require('express-validator');

// POST /api/tasks - Create a new task
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
      return res.status(400).json({ message: 'Invalid purchaseOrderId' });
    }
    // Create task
    const task = new Task({
      purchaseOrderId, type, assignedTo, details, deadline, status
    });
    await task.save();
    res.status(201).json(task);
  }
];

// GET /api/tasks/:id - Retrieve a task by _id
exports.getTask = [
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  }
];

// PUT /api/tasks/:id - Update a task
exports.updateTask = [
  param('id').isMongoId(),
  body('type').optional().isIn(['Picking', 'Packing', 'Quality Check', 'Shipping']),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
  body('assignedTo').optional().isString().notEmpty(),
  body('details').optional().isString().notEmpty(),
  body('deadline').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const update = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  }
];

// DELETE /api/tasks/:id - Delete a task
exports.deleteTask = [
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(204).send();
  }
];

// GET /api/purchase-orders/:purchaseOrderId/tasks - List all tasks for a purchase order
exports.getTasksByPurchaseOrder = [
  param('purchaseOrderId').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const tasks = await Task.find({ purchaseOrderId: req.params.purchaseOrderId });
    res.json(tasks);
  }
];

// GET /api/tasks - List all tasks (for admin/manager views)
exports.getTasks = async (req, res) => {
  try {
    console.log('Fetching all tasks...');
    const tasks = await Task.find({}).lean();
    console.log('Found tasks:', tasks);
    res.json(tasks);
  } catch (err) {
    console.error('Error in getTasks:', err);
    res.status(500).json({ 
      message: 'Error fetching tasks',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Test endpoint to check task creation
exports.testTaskCreation = async (req, res) => {
  try {
    console.log('Testing task creation...');
    const testTask = new Task({
      purchaseOrderId: new mongoose.Types.ObjectId(),
      type: 'Picking',
      assignedTo: 'Test User',
      details: 'Test task',
      status: 'Pending',
      deadline: new Date()
    });
    
    const savedTask = await testTask.save();
    console.log('Test task created:', savedTask);
    
    // Verify the task exists in the database
    const foundTask = await Task.findById(savedTask._id);
    console.log('Found test task in DB:', foundTask);
    
    res.json({
      success: true,
      createdTask: savedTask,
      verified: foundTask !== null
    });
    
  } catch (error) {
    console.error('Test task creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};