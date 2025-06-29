const PurchaseOrder = require('../model/purchaseOrder');

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
        res.status(201).json({ message: 'Purchase order created', order });
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

// Approve a purchase order (manager only)
exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).send('Purchase order not found');
        if (order.status !== 'pending') return res.status(400).json({ message: 'PO is not pending' });
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
        // Only allow valid transitions
        if (order.status === 'processing' && next === 'shipping') {
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
        // Simulate invoice generation
        order.invoiceUrl = `/invoices/PO-${order._id}.pdf`;
        await order.save();
        res.json({ message: 'Invoice generated', invoiceUrl: order.invoiceUrl });
    } catch (err) {
        res.status(500).send('Error generating invoice: ' + err.message);
    }
};
