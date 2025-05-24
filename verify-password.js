const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

async function verifyPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'super@admin.com';
    const testPassword = 'testpassword'; // Updated to the correct password

    // Find user
    const user = await mongoose.connection.db.collection('users').findOne({ email });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('User found:', {
      email: user.email,
      role: user.role,
      hashedPassword: user.password
    });

    // Verify password
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password verification:', {
      providedPassword: testPassword,
      isPasswordValid
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyPassword();