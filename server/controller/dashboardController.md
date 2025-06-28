# Dashboard Controller (`dashboardController.js`)

This controller provides API endpoints for dashboard statistics, task summaries, and stock levels in the warehouse management system backend.

---

## Line-by-Line Explanation

```js
const express = require('express');
const Order = require('../model/order');
const Customer = require('../model/customer');
const Product = require('../model/product');
const Task = require('../model/task');
```
- Imports Express (not strictly needed here), and the Mongoose models for orders, customers, products, and tasks.

---

### getStats
```js
const getStats = async (req, res) => {
    const role = req.user?.role;
    if (!role) {
        return res.status(401).json({ message: 'Unauthorized: No role found' });
    }
    try {
        // Fetch real data from the database
        const [totalOrders, totalRevenueAgg, totalCustomers, totalProducts, totalTasks, completedTasks, lowStockProducts] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),
            Customer.countDocuments(),
            Product.countDocuments(),
            Task.countDocuments(),
            Task.countDocuments({ status: 'completed' }),
            Product.countDocuments({ stock: { $lte: 10 } }) // Adjust threshold as needed
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        const stats = {
            totalOrders,
            totalRevenue,
            totalCustomers,
            totalProducts,
            totalTasks,
            completedTasks,
            lowStockProducts
        };
        if (role === 'superadmin') {
            return res.json(stats);
        } else if (role === 'manager') {
            const { totalRevenue, ...managerStats } = stats;
            return res.json(managerStats);
        } else if (role === 'user') {
            return res.json({
                totalProducts: stats.totalProducts,
                totalTasks: stats.totalTasks,
                completedTasks: stats.completedTasks,
                lowStockProducts: stats.lowStockProducts
            });
        } else {
            return res.status(403).json({ message: 'Forbidden: unknown role' });
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        return res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};
```
- Gets the user's role from the request.
- If no role, returns 401 Unauthorized.
- Uses `Promise.all` to fetch all stats in parallel:
  - Total orders, total revenue (aggregated), total customers, total products, total tasks, completed tasks, and low stock products.
- Returns different stats depending on the user's role (superadmin, manager, user).
- Handles errors and logs them.

---

### getTasks
```js
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({}, 'title status priority');
        const formatted = tasks.map(task => ({
            id: task._id,
            title: task.title,
            status: task.status,
            priority: task.priority
        }));
        return res.json(formatted);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        return res.status(500).json({ message: 'Error fetching tasks' });
    }
};
```
- Fetches all tasks, selecting only `title`, `status`, and `priority` fields.
- Maps tasks to a simplified format for the dashboard.
- Returns the formatted list or an error.

---

### getStock
```js
const getStock = async (req, res) => {
    try {
        const products = await Product.find({}, 'name stock');
        const formatted = products.map(product => ({
            id: product._id,
            productName: product.name,
            quantity: product.stock,
            reorderLevel: 10 // You can adjust or fetch from product if available
        }));
        return res.json(formatted);
    } catch (err) {
        console.error('Error fetching stock:', err);
        return res.status(500).json({ message: 'Error fetching stock' });
    }
};
```
- Fetches all products, selecting only `name` and `stock` fields.
- Maps products to a format suitable for dashboard stock widgets.
- Returns the formatted list or an error.

---

## Exported Functions
```js
module.exports = {
    getStats,
    getTasks,
    getStock
};
```
- Exports the three main controller functions for use in the router.

---

## Summary Table
| Function   | What it does                        | Returns           |
|------------|-------------------------------------|-------------------|
| getStats   | Returns dashboard statistics        | Stats object      |
| getTasks   | Returns summary of tasks            | Array of tasks    |
| getStock   | Returns product stock info          | Array of products |

---

## Notes
- All functions use `try/catch` for error handling.
- Role-based data filtering is performed in `getStats`.
- Designed for dashboard widgets and analytics.
