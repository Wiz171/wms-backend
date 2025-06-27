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
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            const error = new Error('Request body cannot be empty');
            error.status = 400;
            throw error;
        }

        let update = { ...req.body };
        
        // Defensive: Handle specs field
        if ('specs' in update) {
            if (typeof update.specs !== 'object' || Array.isArray(update.specs) || update.specs === null) {
                delete update.specs;
            } else if (Object.keys(update.specs).length === 0) {
                delete update.specs;
            }
        }

        // Check if product exists
        const targetProduct = await Product.findById(id);
        if (!targetProduct) {
            const error = new Error('Product not found');
            error.status = 404;
            throw error;
        }
        
        // Managers can edit all products, no additional checks needed

        // Update the product
        const product = await Product.findByIdAndUpdate(
            id, 
            update, 
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!product) {
            const error = new Error('Product not found');
            error.status = 404;
            throw error;
        }

        // Log the action
        try {
            await logAction({
                action: 'update',
                entity: 'product',
                entityId: product._id,
                user: req.user,
                details: { 
                    updatedFields: Object.keys(update),
                    product: product.toObject()
                }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
            // Don't fail the request if logging fails
        }

        // Send success response
        res.status(200).json({ 
            status: 'success',
            message: 'Product updated successfully',
            data: {
                product
            }
        });

    } catch (err) {
        // Pass the error to the error handling middleware
        next(err);
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
