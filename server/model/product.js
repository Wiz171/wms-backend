const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    specs: {
        type: Object, // Flexible for dynamic specs (key-value pairs)
        default: {}
    },
    category: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    image: {
        type: String // URL or path to image
    },
    // You can add more fields as needed, e.g. category, stock, tags, etc.
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
