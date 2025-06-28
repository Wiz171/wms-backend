// Script to ensure manager has update permission on products
const mongoose = require('mongoose');
const RolePermission = require('./server/model/rolePermission'); // Adjust path as necessary
require('dotenv').config({ path: 'config.env' });

async function fixManagerPermissions() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const manager = await RolePermission.findOne({ role: 'manager' });
  if (!manager) {
    console.log('No manager role found.');
    process.exit(1);
  }
  if (!manager.permissions.products) manager.permissions.products = [];
  if (!manager.permissions.products.includes('update')) {
    manager.permissions.products.push('update');
    await manager.save();
    console.log('Added update permission for manager on products.');
  } else {
    console.log('Manager already has update permission on products.');
  }
  process.exit(0);
}

fixManagerPermissions();
