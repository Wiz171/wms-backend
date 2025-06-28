const OrderStatusHistory = require('../model/orderStatusHistory');
const { logAction } = require('../utils/logAction');

/**
 * Middleware to log order status changes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const logOrderStatusChange = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        
        // Only proceed if this is a status change request
        if (!status) return next();
        
        // Create status history record
        const statusHistory = new OrderStatusHistory({
            order: id,
            status,
            changedBy: req.user._id,
            reason,
            metadata: {
                ip: req.ip,
                userAgent: req.get('user-agent'),
                ...(req.body.metadata || {})
            }
        });
        
        await statusHistory.save();
        
        // Log the action
        await logAction({
            action: `order_status_${status}`,
            entity: 'order',
            entityId: id,
            user: req.user,
            details: { status, reason }
        });
        
        next();
    } catch (error) {
        console.error('Error logging order status change:', error);
        // Don't fail the request if logging fails
        next();
    }
};

module.exports = logOrderStatusChange;
