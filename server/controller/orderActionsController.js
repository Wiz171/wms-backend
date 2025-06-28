const Order = require('../model/order');
const DeliveryOrder = require('../model/deliveryOrder');
const Task = require('../model/task');
const { logAction } = require('../utils/logAction');
const mongoose = require('mongoose');

// Accept an order and create a task
const acceptOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const order = await Order.findById(id).session(session);
        
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.status !== 'pending') {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Order is not in pending status' });
        }
        
        // Update order status
        order.status = 'accepted';
        await order.save({ session });
        
        // Create a task for order processing
        const task = new Task({
            title: `Process Order #${order._id}`,
            description: `Order from ${order.customerName}`,
            type: 'order_processing',
            status: 'pending',
            dueDate: order.expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            assignedTo: req.user._id,
            order: order._id
        });
        
        await task.save({ session });
        await logAction({
            action: 'accept',
            entity: 'order',
            entityId: order._id,
            user: req.user,
            details: { status: 'accepted' }
        });
        
        await session.commitTransaction();
        res.json({ 
            message: 'Order accepted successfully', 
            order: await Order.findById(id).populate('items.productId') 
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error accepting order:', error);
        res.status(500).json({ message: 'Error accepting order: ' + error.message });
    } finally {
        session.endSession();
    }
};

// Reject an order
const rejectOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id).session(session);
        
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }
        
        await logAction({
            action: 'reject',
            entity: 'order',
            entityId: id,
            user: req.user,
            details: { status: 'rejected' }
        });
        
        await session.commitTransaction();
        res.json({ message: 'Order rejected and deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error rejecting order:', error);
        res.status(500).json({ message: 'Error rejecting order: ' + error.message });
    } finally {
        session.endSession();
    }
};

// Convert accepted order to delivery order
const switchToDeliveryOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const order = await Order.findById(id).session(session);
        
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.status !== 'accepted') {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Only accepted orders can be converted to delivery orders' });
        }
        
        // Generate DO number (format: DO-YYYYMMDD-XXXX)
        const date = new Date();
        const count = await DeliveryOrder.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
            }
        }).session(session);
        
        const doNumber = `DO-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;
        
        // Create delivery order
        const deliveryOrder = new DeliveryOrder({
            doNumber,
            poNumber: `PO-${order._id.toString().slice(-6).toUpperCase()}`,
            order: order._id,
            items: order.items.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: order.total,
            customerName: order.customerName,
            deliveryDate: new Date(),
            status: 'pending',
            createdBy: req.user._id,
            transportInfo: {
                // Default empty transport info, can be updated later
                transporter: '',
                vehicleNumber: '',
                driverName: '',
                contactNumber: ''
            }
        });
        
        await deliveryOrder.save({ session });
        
        // Update order status
        order.status = 'processing';
        order.deliveryOrder = deliveryOrder._id;
        await order.save({ session });
        
        await logAction({
            action: 'convert_to_do',
            entity: 'order',
            entityId: order._id,
            user: req.user,
            details: { doNumber, deliveryOrderId: deliveryOrder._id }
        });
        
        await session.commitTransaction();
        
        const populatedDO = await DeliveryOrder.findById(deliveryOrder._id)
            .populate('items.product')
            .populate('createdBy', '-password');
            
        res.json({
            message: 'Order converted to delivery order successfully',
            deliveryOrder: populatedDO
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error converting to delivery order:', error);
        res.status(500).json({ message: 'Error converting to delivery order: ' + error.message });
    } finally {
        session.endSession();
    }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'delivered'].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid status. Must be either "pending" or "delivered"' });
        }
        
        const deliveryOrder = await DeliveryOrder.findByIdAndUpdate(
            id,
            { status },
            { new: true, session }
        );
        
        if (!deliveryOrder) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Delivery order not found' });
        }
        
        // If delivered, update the related order status
        if (status === 'delivered') {
            await Order.findByIdAndUpdate(
                deliveryOrder.order,
                { status: 'completed' },
                { session }
            );
        }
        
        await logAction({
            action: 'update_delivery_status',
            entity: 'delivery_order',
            entityId: deliveryOrder._id,
            user: req.user,
            details: { status }
        });
        
        await session.commitTransaction();
        res.json({
            message: `Delivery order marked as ${status} successfully`,
            deliveryOrder
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: 'Error updating delivery status: ' + error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    acceptOrder,
    rejectOrder,
    switchToDeliveryOrder,
    updateDeliveryStatus
};
