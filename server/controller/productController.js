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
        let update = req.body;
        // Defensive: Remove specs if it's not a non-empty object
        if ('specs' in update && (typeof update.specs !== 'object' || Array.isArray(update.specs) || Object.keys(update.specs).length === 0)) {
            delete update.specs;
        }
        // Prevent manager from editing another manager or superadmin
        if (req.user.role === 'manager') {
            const targetUser = await Product.findById(id).populate('createdBy');
            if (targetUser && targetUser.createdBy && (targetUser.createdBy.role === 'manager' || targetUser.createdBy.role === 'superadmin')) {
                return res.status(403).json({ message: 'Managers cannot edit users with manager or superadmin role.' });
            }
        }
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
        console.error('Error updating product:', err);
        // Ensure we always return JSON
        res.status(500).json({ 
            error: 'Failed to update product',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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
