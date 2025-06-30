# model.js Documentation

This file defines the Mongoose schema and model for users in the warehouse management system, including password hashing and utility methods.

---

```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
```
- Imports the Mongoose library and bcrypt for password hashing.

```js
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    gender: String,
    status: String,
    role: {
        type: String,
        enum: {
            values: ['superadmin', 'manager', 'user'],
            message: 'Role must be either superadmin, manager, or user'
        },
        default: 'user',
        required: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
```
- Defines the schema for a user:
  - `name`: User's name (required, trimmed, 2-50 chars).
  - `email`: User's email (required, unique, validated, lowercased).
  - `gender`, `status`: Optional fields.
  - `role`: User's role (enum, required, default 'user').
  - `password`: Hashed password (required, min 6 chars, not selected by default).
  - `isActive`: Whether the user is active (default true).
  - `lastLogin`: Last login date (default null).
  - `createdAt`, `updatedAt`: Timestamps (default now).
  - `{ timestamps: true }` also adds automatic timestamps.

```js
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
```
- Pre-save hook to hash the password if it was modified.

```js
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};
```
- Instance method to compare a candidate password with the hashed password.

```js
userSchema.methods.toPublicProfile = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};
```
- Instance method to return a public profile object (without sensitive fields).

```js
const User = mongoose.model('User', userSchema);
```
- Creates the Mongoose model for users.

```js
module.exports = User;
```
- Exports the User model for use in other files.
