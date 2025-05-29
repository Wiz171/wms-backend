const Customer = require('../model/customer');
const { logAction } = require('../utils/logAction');

// Create a new customer
exports.create = async (req, res) => {
    try {
        const customerData = req.body;
        if (req.user && req.user._id) {
            customerData.createdBy = req.user._id;
        }
        // Check for existing customer by email
        const existing = await Customer.findOne({ email: customerData.email });
        if (existing) {
            return res.status(409).json({ message: 'Customer with this email already exists', customer: existing });
        }
        console.log('Customer create request:', customerData); // Debug log
        const customer = new Customer(customerData);
        await customer.save();
        // Log action
        await logAction({
          action: 'create',
          entity: 'customer',
          entityId: customer._id,
          user: req.user,
          details: { email: customer.email, name: customer.name }
        });
        console.log('Customer saved:', customer); // Debug log
        res.status(201).json({ message: 'Customer created', customer });
    } catch (err) {
        console.error('Customer create error:', err); // Debug log
        res.status(500).send('Error creating customer: ' + err.message);
    }
};

// Get all customers
exports.find = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        res.status(500).send('Error fetching customers: ' + err.message);
    }
};

// Update a customer
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const customer = await Customer.findByIdAndUpdate(id, update, { new: true });
        if (!customer) return res.status(404).send('Customer not found');
        res.json({ message: 'Customer updated', customer });
    } catch (err) {
        res.status(500).send('Error updating customer: ' + err.message);
    }
};

// Delete a customer
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) return res.status(404).send('Customer not found');
        res.json({ message: 'Customer deleted', customer });
    } catch (err) {
        res.status(500).send('Error deleting customer: ' + err.message);
    }
};
