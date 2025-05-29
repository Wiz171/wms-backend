const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  const maxRetries = 3;
  let retries = 0;

  const connectWithRetry = async () => {
    try {
      const con = await mongoose.connect(process.env.MONGO_URI, options);
      console.log(`MongoDB connected: ${con.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        if (retries < maxRetries) {
          retries++;
          setTimeout(connectWithRetry, 5000);
        } else {
          console.error('Max retries reached. Could not connect to MongoDB.');
          process.exit(1);
        }
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        retries = 0;
      });

    } catch (err) {
      console.error('MongoDB connection error:', err);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying connection (${retries}/${maxRetries})...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

module.exports = connectDB;