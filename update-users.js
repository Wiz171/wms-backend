const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update users in users collection
    const result = await mongoose.connection.db.collection('users').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log('Update result:', result);

    // Verify the update
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nUpdated users:');
    users.forEach(user => {
      console.log({
        email: user.email,
        isActive: user.isActive,
        role: user.role
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUsers(); 