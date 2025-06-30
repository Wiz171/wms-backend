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
        let query = {};
        if (req.user.role === 'manager') {
            query = { role: { $ne: 'superadmin' } };
        } else if (req.user.role === 'user') {
            query = { _id: req.user._id };
        }
        const users = await User.find(query, '-password');
        res.json({ status: 'success', data: users });
    } catch (err) {
        res.status(500).send('Error fetching users: ' + err.message);
    }
};

// Get single user (for read/edit)
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, '-password');
        // If manager, block access to superadmin info
        if (req.user.role === 'manager' && user && user.role === 'superadmin') {
            return res.status(403).send('Managers are not allowed to view superadmin info');
        }
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(500).send('Error fetching user: ' + err.message);
    }
};

// Update user
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        // Prevent manager from editing superadmin or another manager
        const targetUser = await User.findById(id);
        if (req.user.role === 'manager' && targetUser && (targetUser.role === 'superadmin' || targetUser.role === 'manager')) {
            return res.status(403).send('Managers cannot edit users with manager or superadmin role');
        }
        // Prevent manager from assigning superadmin or manager role
        if (req.user.role === 'manager' && update.role && (update.role === 'superadmin' || update.role === 'manager')) {
            return res.status(403).send('Managers cannot assign manager or superadmin role');
        }
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