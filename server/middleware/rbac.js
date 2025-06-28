const { ForbiddenError } = require('../utils/errors');
const RolePermission = require('../model/rolePermission');

// Define role constants
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  USER: 'user'
};

// Define module constants
const MODULES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  PURCHASE_ORDERS: 'purchase_orders',
  ORDERS: 'orders',
  TASKS: 'tasks',
  DASHBOARD: 'dashboard'
};

// Define action constants
const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage' // Special action that includes all other actions
};

// Helper function to check if a role has permission for an action on a module (from DB)
const hasPermissionDb = async (role, module, action) => {
  const rolePerm = await RolePermission.findOne({ role });
  if (!rolePerm) return false;
  const modulePermissions = rolePerm.permissions[module];
  if (!modulePermissions) return false;
  return modulePermissions.includes('manage') || modulePermissions.includes(action);
};

// Middleware to check permissions using DB
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }
      const { role } = req.user;
      if (!role || !(await hasPermissionDb(role, module, action))) {
        throw new ForbiddenError(`User does not have permission to ${action} ${module}`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to get user's allowed modules and actions from DB
const getUserPermissions = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }
    const { role } = req.user;
    const rolePerm = await RolePermission.findOne({ role });
    if (!rolePerm) {
      res.locals.userPermissions = {};
      return next();
    }
    // Transform permissions into a more frontend-friendly format
    const allowedModules = Object.entries(rolePerm.permissions).reduce((acc, [module, actions]) => {
      acc[module] = {
        allowed: true,
        actions: actions.includes(ACTIONS.MANAGE)
          ? Object.values(ACTIONS).filter(a => a !== ACTIONS.MANAGE)
          : actions
      };
      return acc;
    }, {});
    res.locals.userPermissions = allowedModules;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict role/permission editing to super_admin only
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.SUPER_ADMIN) {
    return next(new ForbiddenError('Only super_admin can edit roles and permissions'));
  }
  next();
};

module.exports = {
  ROLES,
  MODULES,
  ACTIONS,
  checkPermission,
  getUserPermissions: getUserPermissions,
  requireSuperAdmin
};