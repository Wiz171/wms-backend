# product.js Documentation

This file defines the Mongoose schema and model for products in the warehouse management system.

---

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library for MongoDB object modeling.

```js
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
```
- Defines the schema for a product:
  - `name`: Product name (required).
  - `description`: Optional description.
  - `price`: Product price (required).
  - `createdBy`: Reference to the user who created the product.
  - `createdAt`: Creation timestamp (defaults to now).
  - `specs`: Flexible object for dynamic product specifications.
  - `category`: Product category (optional, defaults to empty string).
  - `stock`: Number of items in stock (defaults to 0).
  - `sku`: Stock keeping unit (optional, defaults to empty string).
  - `image`: URL or path to product image (optional).

```js
const Product = mongoose.model('Product', productSchema);
```
- Creates the Mongoose model for products.

```js
module.exports = Product;
```
- Exports the Product model for use in other files.
