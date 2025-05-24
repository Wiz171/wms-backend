const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const User = require('./server/model/model');

async function hashPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      // Try direct collection access
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
      
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log(`Found ${users.length} users in users collection`);

      // Hash passwords in users collection
      for (const user of users) {
        if (!user.password.startsWith('$2')) { // Only hash if not already hashed
          const hashedPassword = await bcrypt.hash(user.password, 12);
          await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          console.log(`Updated password for user: ${user.email}`);
        } else {
          console.log(`Password already hashed for user: ${user.email}`);
        }
      }
    } else {
      // Hash passwords in User model
      for (const user of users) {
        if (!user.password.startsWith('$2')) { // Only hash if not already hashed
          const hashedPassword = await bcrypt.hash(user.password, 12);
          user.password = hashedPassword;
          await user.save();
          console.log(`Updated password for user: ${user.email}`);
        } else {
          console.log(`Password already hashed for user: ${user.email}`);
        }
      }
    }

    console.log('Password hashing completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashPasswords(); 