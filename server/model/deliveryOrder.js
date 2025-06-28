const mongoose = require('mongoose');

const deliveryOrderSchema = new mongoose.Schema({
    doNumber: { type: String, required: true, unique: true },
    poNumber: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    totalAmount: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true },
    deliveryDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['pending', 'delivered'], 
        default: 'pending' 
    },
    transportInfo: {
        transporter: String,
        vehicleNumber: String,
        driverName: String,
        contactNumber: String
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String
}, { timestamps: true });

// Index for faster lookups
deliveryOrderSchema.index({ doNumber: 1 });
deliveryOrderSchema.index({ order: 1 });
deliveryOrderSchema.index({ status: 1 });

const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);

module.exports = DeliveryOrder;
