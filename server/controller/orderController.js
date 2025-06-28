const express = require('express');
const Order = require('../model/order');
const mongoose = require('mongoose');
const { logAction } = require('../utils/logAction');

// Controller methods
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.productId')
            .populate('createdBy', '-password');
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders: ' + err.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const { customerName, items, total, expectedDeliveryDate } = req.body;

        // Validate required fields
        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }
        if (!total || isNaN(total) || total <= 0) {
            return res.status(400).json({ message: 'Valid total amount is required' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }

        // Validate and transform items
        const validatedItems = items.map(item => {
            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                throw new Error(`Invalid product ID: ${item.productId}`);
            }
            if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                throw new Error(`Invalid quantity for product: ${item.productId}`);
            }
            if (!item.price || isNaN(item.price) || item.price < 0) {
                throw new Error(`Invalid price for product: ${item.productId}`);
            }
            return {
                productId: new mongoose.Types.ObjectId(item.productId),
                quantity: Number(item.quantity),
                price: Number(item.price)
            };
        });

        const orderData = {
            customerName,
            items: validatedItems,
            total: Number(total),
            createdBy: req.user._id,
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined
        };

        const order = new Order(orderData);
        await order.save();
        // Log action
        await logAction({
          action: 'create',
          entity: 'order',
          entityId: order._id,
          user: req.user,
          details: { customerName, total }
        });
        
        // Populate the references after saving
        const populatedOrder = await Order.findById(order._id)
            .populate('items.productId')
            .populate('createdBy', '-password');
            
        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error('Error creating order:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ message: 'Error creating order: ' + err.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndUpdate(id, req.body, { new: true })
            .populate('items.productId')
            .populate('createdBy', '-password');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Log action
        await logAction({
          action: 'update',
          entity: 'order',
          entityId: order._id,
          user: req.user,
          details: { updatedFields: Object.keys(req.body) }
        });
        res.json(order);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Error updating order: ' + err.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Log the deletion
        await logAction({
            action: 'delete',
            entity: 'order',
            entityId: order._id,
            user: req.user ? req.user.id : 'system',
            changes: { order: order.toObject() }
        });

        await order.remove();
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Error deleting order: ' + err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId')
            .populate('createdBy', '-password');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ message: 'Error fetching order: ' + err.message });
    }
};

module.exports = {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById
};