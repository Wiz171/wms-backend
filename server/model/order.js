const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        name: { type: String } // Added for easier reference
    }],
    total: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'processing', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expectedDeliveryDate: { type: Date },
    deliveryOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryOrder' },
    rejectionReason: { type: String },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better query performance
orderSchema.index({ status: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ expectedDeliveryDate: 1 });
orderSchema.index({ 'items.productId': 1 });

// Virtual for order status history
orderSchema.virtual('statusHistory', {
    ref: 'OrderStatusHistory',
    localField: '_id',
    foreignField: 'order',
    justOne: false
});

// Pre-save hook to update timestamps based on status changes
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        switch (this.status) {
            case 'accepted':
                this.acceptedAt = new Date();
                break;
            case 'completed':
                this.completedAt = new Date();
                break;
            case 'cancelled':
                this.cancelledAt = new Date();
                break;
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;