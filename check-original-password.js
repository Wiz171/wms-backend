const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function checkOriginalPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users from users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log({
        email: user.email,
        role: user.role,
        password: user.password
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOriginalPassword(); 