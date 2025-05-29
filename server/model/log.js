const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'create', 'update', 'delete'
  entity: { type: String, required: true }, // e.g. 'product', 'customer', 'order', etc.
  entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name: { type: String },
    email: { type: String },
    role: { type: String }
  },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object, default: {} } // Optional: store extra info
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
