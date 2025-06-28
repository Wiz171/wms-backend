# Product Controller (`productController.js`)

This controller manages all product-related API logic for the warehouse management system backend. It provides endpoints for creating, reading, updating, and deleting products, and logs actions for auditing.

---

## Line-by-Line Explanation

```js
const Product = require('../model/product');
const { logAction } = require('../utils/logAction');
```
- Imports the Product Mongoose model and a logging utility for audit trails.

---

### create
```js
exports.create = async (req, res) => {
    try {
        const productData = req.body;
        if (req.user && req.user._id) {
            productData.createdBy = req.user._id;
        }
        // Check for existing product by name
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
```
- Receives product data from the request body.
- Optionally attaches the creator's user ID.
- Checks for duplicate product name.
- Creates and saves a new product.
- Logs the creation action.
- Returns the new product or an error.

---

### find
```js
exports.find = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Error fetching products: ' + err.message);
    }
};
```
- Fetches all products from the database.
- Returns the list or an error.

---

### update
```js
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let update = req.body;
        // Defensive: Remove specs if it's not a non-empty object
        if ('specs' in update && (typeof update.specs !== 'object' || Array.isArray(update.specs) || Object.keys(update.specs).length === 0)) {
            delete update.specs;
        }
        // Prevent manager from editing another manager or superadmin's product
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
        res.status(500).send('Error updating product: ' + err.message);
    }
};
```
- Gets the product ID and update data.
- Removes invalid `specs` field defensively.
- RBAC: managers cannot edit products created by other managers or superadmins.
- Updates the product in the database.
- Logs the update action.
- Returns the updated product or an error.

---

### delete
```js
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
```
- Gets the product ID from the request.
- Deletes the product from the database.
- Logs the deletion action.
- Returns the deleted product or an error.

---

## Exported Functions
- `create`: Creates a new product and logs the action.
- `find`: Returns all products.
- `update`: Updates a product and logs the action.
- `delete`: Deletes a product and logs the action.

---

## Summary Table
| Function   | What it does                        | Returns           |
|------------|-------------------------------------|-------------------|
| create     | Adds a new product                  | New product/info  |
| find       | Lists all products                  | Array of products |
| update     | Updates product by ID               | Updated product   |
| delete     | Deletes product by ID               | Deleted product   |

---

## Notes
- All functions use `try/catch` for error handling.
- Logging is performed for create, update, and delete actions for auditability.
- RBAC and validation are handled by middleware before these functions are called.
