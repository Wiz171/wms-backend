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
