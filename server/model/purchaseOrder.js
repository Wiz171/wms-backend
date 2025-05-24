const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    notes: String
}, { strict: false });

const PurchaseOrder = mongoose.model('PurchaseOrders', purchaseOrderSchema);

module.exports = PurchaseOrder;
