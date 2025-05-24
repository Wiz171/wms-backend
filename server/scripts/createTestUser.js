require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('../model/model');
const connectDB = require('../database/connection');

// Log environment variables
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'Set' : 'Not set'
});

const createTestUser = async () => {
  try {
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
    } else {
      // Create test user
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
        role: 'user',
        isActive: true
      });
      await testUser.save();
      console.log('Test user created successfully');
    }

    // Create super admin user if not exists
    const existingSuperAdmin = await User.findOne({ email: 'super@admin.com' });
    if (existingSuperAdmin) {
      console.log('Super admin user already exists');
    } else {
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: 'testpassword',
        role: 'superadmin',
        isActive: true
      });
      await superAdmin.save();
      console.log('Super admin user created successfully');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();