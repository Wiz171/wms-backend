// Utility to log user actions
const Log = require('../model/log');

/**
 * Log a user action
 * @param {Object} params
 * @param {string} params.action - e.g. 'create', 'update', 'delete'
 * @param {string} params.entity - e.g. 'product', 'customer', 'order', etc.
 * @param {string|ObjectId} [params.entityId] - The affected entity's ID
 * @param {Object} params.user - The user object (should have _id, name, email, role)
 * @param {Object} [params.details] - Any extra details
 */
async function logAction({ action, entity, entityId, user, details = {} }) {
  try {
    await Log.create({
      action,
      entity,
      entityId,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : undefined,
      details,
      timestamp: new Date()
    });
  } catch (err) {
    // Don't block main flow on logging error
    console.error('[Log] Failed to log action:', err);
  }
}

module.exports = { logAction };
