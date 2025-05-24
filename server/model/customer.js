const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({}, { strict: false });
// This allows saving any fields dynamically, like the product model.

const Customer = mongoose.model('Customers', customerSchema);

module.exports = Customer;
