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
        console.log('Starting task creation for purchase order:', order._id);
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
            console.log('Created picking task:', pickingTask);
            await pickingTask.save();
            console.log('Picking task saved:', pickingTask._id);
            
            // Create Packing Task (will be activated after picking)
            const packingTask = new Task({
                purchaseOrderId: order._id,
                type: 'Packing',
                assignedTo: 'Unassigned',
                details: `Pack items for Purchase Order #${order.orderNumber || order._id}`,
                status: 'Pending',
                deadline: new Date(new Date().setDate(new Date().getDate() + 2)) // Due in 2 days
            });
            console.log('Created packing task:', packingTask);
            await packingTask.save();
            console.log('Packing task saved:', packingTask._id);
            
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
            console.log('Successfully created tasks for purchase order:', order._id);
        } catch (taskError) {
            console.error('Error creating tasks for purchase order:', taskError);
            console.error('Task creation error stack:', taskError.stack);
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
        console.log('[DEBUG] PurchaseOrder collection:', PurchaseOrder.collection.name);
        console.log('[DEBUG] PurchaseOrder.find() result:', orders);
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

// Cancel a purchase order (manager only, only if not delivered/cancelled)
exports.cancel = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot cancel a delivered or already cancelled PO' });
        }
        order.status = 'cancelled';
        await order.save();
        res.json({ message: 'Purchase order cancelled', order });
    } catch (err) {
        res.status(500).send('Error cancelling purchase order: ' + err.message);
    }
};

// Approve a purchase order (manager only)
exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status !== 'pending') return res.status(400).json({ message: 'PO is not pending' });
        if (order.status === 'cancelled') return res.status(400).json({ message: 'Cannot approve a cancelled PO' });
        order.status = 'processing';
        await order.save();
        res.json({ message: 'Purchase order approved', order });
    } catch (err) {
        res.status(500).send('Error approving purchase order: ' + err.message);
    }
};

// Advance PO status (assigned user only, valid transitions)
exports.advanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { next } = req.body; // next: 'shipping' or 'delivered'
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status === 'cancelled') return res.status(400).json({ message: 'Cannot advance a cancelled PO' });
        if (order.status === 'processing' && next === 'shipping') {
            if (!order.doCreated) return res.status(400).json({ message: 'Cannot mark as shipping before DO is created' });
            order.status = 'shipping';
        } else if (order.status === 'shipping' && next === 'delivered') {
            order.status = 'delivered';
        } else {
            return res.status(400).json({ message: 'Invalid status transition' });
        }
        await order.save();
        res.json({ message: 'Purchase order status updated', order });
    } catch (err) {
        res.status(500).send('Error advancing PO status: ' + err.message);
    }
};

// Mark DO as created (assigned user only)
exports.createDO = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status !== 'processing') return res.status(400).json({ message: 'Can only create DO when PO is processing' });
        if (order.status === 'cancelled') return res.status(400).json({ message: 'Cannot create DO for a cancelled PO' });
        order.doCreated = true;
        await order.save();
        res.json({ message: 'DO created', order });
    } catch (err) {
        res.status(500).send('Error creating DO: ' + err.message);
    }
};

// Generate invoice (manager only, after delivered)
exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status !== 'delivered') return res.status(400).json({ message: 'PO not delivered yet' });
        if (order.status === 'cancelled') return res.status(400).json({ message: 'Cannot generate invoice for a cancelled PO' });
        // Simulate invoice generation
        order.invoiceUrl = `/invoices/PO-${order._id}.pdf`;
        await order.save();
        res.json({ message: 'Invoice generated', invoiceUrl: order.invoiceUrl });
    } catch (err) {
        res.status(500).send('Error generating invoice: ' + err.message);
    }
};
