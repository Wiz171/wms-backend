const Product = require('../model/product');
const { logAction } = require('../utils/logAction');

// Create a new product
exports.create = async (req, res) => {
    try {
        const productData = req.body;
        if (req.user && req.user._id) {
            productData.createdBy = req.user._id;
        }
        // Check for existing product by name (or another unique field if needed)
        const existing = await Product.findOne({ name: productData.name });
        if (existing) {
            return res.status(409).json({ message: 'Product with this name already exists', product: existing });
        }
        const product = new Product(productData);
        await product.save();
        // Log action
        await logAction({
          action: 'create',
          entity: 'product',
          entityId: product._id,
          user: req.user,
          details: { name: product.name }
        });
        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        res.status(500).send('Error creating product: ' + err.message);
    }
};

// Get all products
exports.find = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Error fetching products: ' + err.message);
    }
};

// Update a product
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const product = await Product.findByIdAndUpdate(id, update, { new: true });
        if (!product) return res.status(404).send('Product not found');
        // Log action
        await logAction({
          action: 'update',
          entity: 'product',
          entityId: product._id,
          user: req.user,
          details: { updatedFields: Object.keys(update) }
        });
        res.json({ message: 'Product updated', product });
    } catch (err) {
        res.status(500).send('Error updating product: ' + err.message);
    }
};

// Delete a product
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).send('Product not found');
        // Log action
        await logAction({
          action: 'delete',
          entity: 'product',
          entityId: id,
          user: req.user,
          details: { name: product.name }
        });
        res.json({ message: 'Product deleted', product });
    } catch (err) {
        res.status(500).send('Error deleting product: ' + err.message);
    }
};
