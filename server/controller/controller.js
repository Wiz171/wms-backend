const mongoose = require('mongoose');
const User = require('../model/model');

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Create a new user
exports.create = async (req, res) => {
    try {
        const { name, email, gender, status, role, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).send('Name, email, and password are required');
        }
        const user = new User({ name, email, gender, status, role, password });
        await user.save();
        res.status(201).json({ message: 'User created', user });
    } catch (err) {
        res.status(500).send('Error creating user: ' + err.message);
    }
};

// Find users
exports.find = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Error fetching users: ' + err.message);
    }
};

// Update user
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const user = await User.findByIdAndUpdate(id, update, { new: true });
        if (!user) return res.status(404).send('User not found');
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).send('Error updating user: ' + err.message);
    }
};

// Delete user
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).send('User not found');
        res.json({ message: 'User deleted', user });
    } catch (err) {
        res.status(500).send('Error deleting user: ' + err.message);
    }
};