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
    status: { type: String, enum: ['pending', 'processing', 'preparing_do', 'preparing_to_ship', 'shipping', 'delivered', 'completed', 'cancelled'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // New: assigned user
    expectedDeliveryDate: { type: Date },
    deliveryDate: { type: Date }, // For invoice
    invoiceUrl: { type: String }, // For generated invoice
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;