const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' } // Link to an order (optional)
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
