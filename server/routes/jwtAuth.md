# jwtAuth.js Documentation

This file provides JWT authentication middleware for Express routes.

---

```js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../model/model');
```
- Imports JWT, Mongoose, and the User model.

```js
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
```
- Ensures the JWT secret is set in environment variables and stores it.

```js
class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
```
- Custom error class for authentication errors.

```js
async function jwtAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AuthError('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthError('No token provided');
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded.id) {
      throw new AuthError('Invalid token payload');
    }

    // Use the User model instead of direct MongoDB access
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AuthError('User not found', 404);
    }

    // Check if user is active
    if (user.isActive === false) {
      throw new AuthError('User account is inactive');
    }

    // Attach user to request object
    req.user = user;
    next();
```
- Middleware to authenticate JWT tokens:
  - Checks for the Authorization header and token.
  - Verifies the token and decodes the payload.
  - Looks up the user by ID and checks if active.
  - Attaches the user to `req.user` and calls `next()`.

---

_Export and error handling code continues as in the file._
