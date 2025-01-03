const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // Reference to User
        name: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
        estimatedTime: { type: Number }, // Time in hours
        status: { type: String, enum: ['Todo', 'In Progress', 'Completed', 'Expired'], default: 'Todo' },
        startDate: { type: Date },
        dueDate: { type: Date },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
