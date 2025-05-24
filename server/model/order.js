const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    total: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expectedDeliveryDate: { type: Date }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;