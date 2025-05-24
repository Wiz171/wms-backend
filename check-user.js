const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers in users collection:');
    users.forEach(user => {
      console.log({
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive
      });
    });

    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers in users collection:');
    users.forEach(user => {
      console.log({
        email: user.email,
        password: user.password,
        role: user.role,
        isActive: user.isActive
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser(); 