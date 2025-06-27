const PurchaseOrder = require('../model/purchaseOrder');
const Task = require('../model/task');
const { logAction } = require('../utils/logAction');

// Create a new purchase order
exports.create = async (req, res) => {
    try {
        const orderData = req.body;
        if (req.user && req.user._id) {
            orderData.createdBy = req.user._id;
        }
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        if (!orderData.deliveryDate) {
            return res.status(400).json({ message: 'Delivery date is required' });
        }
        const order = new PurchaseOrder(orderData);
        await order.save();
        
        // Create tasks for the purchase order
        try {
            // Create Picking Task
            const pickingTask = new Task({
                purchaseOrderId: order._id,
                type: 'Picking',
                assignedTo: 'Unassigned',
                details: `Pick items for Purchase Order #${order.orderNumber || order._id}`,
                status: 'Pending',
                deadline: new Date(new Date().setDate(new Date().getDate() + 1)) // Due tomorrow
            });
            await pickingTask.save();
            
            // Create Packing Task (will be activated after picking)
            const packingTask = new Task({
                purchaseOrderId: order._id,
                type: 'Packing',
                assignedTo: 'Unassigned',
                details: `Pack items for Purchase Order #${order.orderNumber || order._id}`,
                status: 'Pending',
                deadline: new Date(new Date().setDate(new Date().getDate() + 2)) // Due in 2 days
            });
            await packingTask.save();
            
            // Log the action
            await logAction({
                action: 'create',
                entity: 'purchaseOrder',
                entityId: order._id,
                user: req.user,
                details: { 
                    orderNumber: order.orderNumber,
                    taskCount: 2 // Picking and Packing tasks created
                }
            });
        } catch (taskError) {
            console.error('Error creating tasks for purchase order:', taskError);
            // Don't fail the request if task creation fails
        }
        
        res.status(201).json({ 
            message: 'Purchase order created', 
            order,
            tasksCreated: true
        });
    } catch (err) {
        res.status(500).send('Error creating purchase order: ' + err.message);
    }
};

// Get all purchase orders
exports.find = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find().populate('items.product').populate('createdBy', '-password');
        res.json(orders);
    } catch (err) {
        res.status(500).send('Error fetching purchase orders: ' + err.message);
    }
};

// Update a purchase order
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const order = await PurchaseOrder.findByIdAndUpdate(id, update, { new: true });
        if (!order) return res.status(404).send('Purchase order not found');
        res.json({ message: 'Purchase order updated', order });
    } catch (err) {
        res.status(500).send('Error updating purchase order: ' + err.message);
    }
};

// Delete a purchase order
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findByIdAndDelete(id);
        if (!order) return res.status(404).send('Purchase order not found');
        res.json({ message: 'Purchase order deleted', order });
    } catch (err) {
        res.status(500).send('Error deleting purchase order: ' + err.message);
    }
};
