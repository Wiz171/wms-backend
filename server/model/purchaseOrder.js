const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    notes: String,
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipping', 'delivered', 'rejected', 'cancelled'],
        default: 'pending',
        required: true
    },
    doCreated: {
        type: Boolean,
        default: false
    },
    invoiceUrl: {
        type: String
    },
    // Rejection details
    rejectionReason: {
        type: String,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { strict: false });

const PurchaseOrder = mongoose.model('PurchaseOrders', purchaseOrderSchema);

module.exports = PurchaseOrder;
