# roleMiddleware.js Documentation

This file provides a simple role-based access control middleware for Express routes.

---

```js
// Role-based access control middleware
// Usage: roleMiddleware(['superadmin', 'manager'])

function roleMiddleware(allowedRoles) {
    return function (req, res, next) {
        // Now req.user is set by jwtAuth
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).send('Role not found');
        }
        if (allowedRoles.includes(userRole)) {
            return next();
        }
        return res.status(403).send('Forbidden: insufficient permissions');
    };
}

module.exports = roleMiddleware;
```
- Exports a function that takes an array of allowed roles and returns middleware.
- The middleware checks if `req.user.role` is present and allowed.
- If not, responds with 401 (no role) or 403 (forbidden).
- If allowed, calls `next()` to proceed.
