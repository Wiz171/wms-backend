const { ForbiddenError } = require('../utils/errors');
const RolePermission = require('../model/rolePermission');

// Define role hierarchy and permissions
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  USER: 'user'
};

// Define module permissions
const MODULES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  PURCHASE_ORDERS: 'purchase_orders',
  ORDERS: 'orders',
  TASKS: 'tasks',
  DASHBOARD: 'dashboard'
};

// Define actions
const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage' // Special action that includes all other actions
};

// Define role-based permissions
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    [MODULES.USERS]: [ACTIONS.MANAGE],
    [MODULES.PRODUCTS]: [ACTIONS.MANAGE],
    [MODULES.CUSTOMERS]: [ACTIONS.MANAGE],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.MANAGE],
    [MODULES.ORDERS]: [ACTIONS.MANAGE],
    [MODULES.TASKS]: [ACTIONS.MANAGE],
    [MODULES.DASHBOARD]: [ACTIONS.MANAGE]
  },
  [ROLES.MANAGER]: {
    [MODULES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [MODULES.PRODUCTS]: [ACTIONS.MANAGE],
    [MODULES.CUSTOMERS]: [ACTIONS.MANAGE],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.MANAGE],
    [MODULES.ORDERS]: [ACTIONS.MANAGE],
    [MODULES.TASKS]: [ACTIONS.MANAGE],
    [MODULES.DASHBOARD]: [ACTIONS.MANAGE]
  },
  [ROLES.USER]: {
    [MODULES.PRODUCTS]: [ACTIONS.READ],
    [MODULES.CUSTOMERS]: [ACTIONS.READ],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.READ],
    [MODULES.ORDERS]: [ACTIONS.READ],
    [MODULES.TASKS]: [ACTIONS.READ],
    [MODULES.DASHBOARD]: [ACTIONS.READ]
  }
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

// Middleware to get user's allowed modules and actions
const getUserPermissions = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('User not authenticated');
    }

    const { role } = req.user;
    const permissions = ROLE_PERMISSIONS[role] || {};

    // Transform permissions into a more frontend-friendly format
    const allowedModules = Object.entries(permissions).reduce((acc, [module, actions]) => {
      acc[module] = {
        allowed: true,
        actions: actions.includes(ACTIONS.MANAGE) 
          ? Object.values(ACTIONS).filter(a => a !== ACTIONS.MANAGE)
          : actions
      };
      return acc;
    }, {});

    // Add the permissions to the response
    res.locals.userPermissions = allowedModules;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ROLES,
  MODULES,
  ACTIONS,
  checkPermission,
  getUserPermissions
};