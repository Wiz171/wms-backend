# userProfile.js Documentation

This file defines Express routes for user profile management, including viewing and updating the current user's profile and changing passwords.

---

```js
const express = require('express');
const router = express.Router();
const User = require('../model/model');
const { verifyToken } = require('../middleware/auth');
```
- Imports Express, creates a router, imports the User model, and JWT auth middleware.

```js
// Get current user's profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
```
- GET `/me`: Returns the current user's profile (excluding password). Requires authentication.

```js
// Update current user's profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.role; // Prevent role change from here
    delete updates.password; // Prevent password change from here
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Log profile update
    const { logAction } = require('../utils/logAction');
    await logAction({
      action: 'update',
      entity: 'user-profile',
      entityId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      details: { updatedFields: Object.keys(updates) }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
```
- PUT `/me`: Updates the current user's profile (excluding role and password). Logs the update. Requires authentication.

```js
// Change password endpoint
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // ...existing code for password change...
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
```
- POST `/change-password`: Changes the current user's password. Requires authentication.

---

_Export and error handling code continues as in the file._
