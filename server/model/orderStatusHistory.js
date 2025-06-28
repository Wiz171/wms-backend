const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
    order: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'accepted', 'rejected', 'processing', 'completed', 'cancelled']
    },
    changedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    reason: String,
    metadata: mongoose.Schema.Types.Mixed
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster lookups
orderStatusHistorySchema.index({ order: 1 });
orderStatusHistorySchema.index({ status: 1 });
orderStatusHistorySchema.index({ changedBy: 1 });
orderStatusHistorySchema.index({ createdAt: -1 });

// Add a pre-save hook to validate the status transition
orderStatusHistorySchema.pre('save', async function(next) {
    try {
        const Order = mongoose.model('Order');
        const order = await Order.findById(this.order);
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        // You can add validation logic here if needed for status transitions
        
        next();
    } catch (error) {
        next(error);
    }
});

const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);

module.exports = OrderStatusHistory;
