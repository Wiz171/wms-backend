const Log = require('../model/log');

// Get all logs (optionally filter by user, entity, etc.)
exports.getLogs = async (req, res) => {
  try {
    // Optionally add filters (e.g., by user, entity, action)
    const query = {};
    if (req.query.userId) query['user._id'] = req.query.userId;
    if (req.query.entity) query.entity = req.query.entity;
    if (req.query.action) query.action = req.query.action;
    const logs = await Log.find(query).sort({ timestamp: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};
