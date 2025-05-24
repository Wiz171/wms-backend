// Script to seed role permissions into the database
require('dotenv').config({ path: '../../config.env' });
const mongoose = require('mongoose');
const RolePermission = require('../model/rolePermission');
const connectDB = require('../database/connection');

const seed = async () => {
  await connectDB();
  const permissions = [
    {
      role: 'superadmin',
      permissions: {
        users: ['manage'],
        products: ['manage'],
        customers: ['manage'],
        purchase_orders: ['manage'],
        orders: ['manage'],
        tasks: ['manage'],
        dashboard: ['manage']
      }
    },
    {
      role: 'manager',
      permissions: {
        users: ['create', 'read', 'update'],
        products: ['manage'],
        customers: ['manage'],
        purchase_orders: ['manage'],
        orders: ['manage'],
        tasks: ['manage'],
        dashboard: ['manage']
      }
    },
    {
      role: 'user',
      permissions: {
        products: ['read'],
        customers: ['read'],
        purchase_orders: ['read'],
        orders: ['read'],
        tasks: ['read'],
        dashboard: ['read']
      }
    }
  ];
  for (const perm of permissions) {
    await RolePermission.findOneAndUpdate(
      { role: perm.role },
      perm,
      { upsert: true, new: true }
    );
  }
  console.log('Role permissions seeded.');
  process.exit(0);
};

seed();
