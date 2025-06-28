# Auth Middleware (`auth.js`)

This file provides authentication middleware for the warehouse management system backend, handling JWT verification and token generation.

---

## Line-by-Line Explanation

```js
const jwt = require('jsonwebtoken');
const User = require('../model/model');
```
- Imports the JWT library and the User model.

---

### generateTokens
- Generates access and refresh tokens for a user using JWT.
- Uses secrets from environment variables.
- Returns the tokens.

---

### verifyToken
- Middleware to verify the JWT from the Authorization header.
- If valid, attaches the user to `req.user` and calls `next()`.
- If invalid or missing, returns a 401 Unauthorized error.

---

## Exported Functions
- `generateTokens`: Generates JWT tokens for a user.
- `verifyToken`: Middleware to protect routes and attach user info.

---

## Summary Table
| Function        | What it does                        | Returns/Effect    |
|-----------------|-------------------------------------|-------------------|
| generateTokens  | Creates JWT tokens for a user       | Tokens object     |
| verifyToken     | Verifies JWT and attaches user      | Calls next() or 401|

---

## Notes
- Used to secure API endpoints and manage user sessions.
- Relies on secrets set in environment variables.
