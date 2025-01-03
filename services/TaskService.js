const { default: mongoose } = require('mongoose');
const Task = require('../models/Task');
const moment = require('moment');

/**
 * Create a new task
 */
const createTask = async (taskData) => {
    return await Task.create(taskData);
};

const getTasksByUser = async (userId, queryParams) => {
    const { search, priority, status, sortBy } = queryParams;

    // Filter tasks by userId
    let query = { userId };

    if (search) {
        query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    if (priority) {
        query.priority = priority;
    }
    if (status) {
        query.status = status;
    }

    // Sorting criteria
    const sortCriteria = sortBy ? { [sortBy]: 1 } : { createdAt: -1 };

    // Fetch tasks with filters and sorting
    return await Task.find(query).sort(sortCriteria);
};

const getTaskByUserId = async (userId) => {
    try {
        return await Task.find({ userId }).sort({ createdAt: -1 }); // Fetch tasks for the user, sorted by creation date
    } catch (error) {
        console.error('Error fetching tasks for user:', error);
        throw new Error('Error fetching tasks.');
    }
};

/**
 * Find a task by name for a specific user
 */
const getTaskByNameAndUser = async (name, userId) => {
    return await Task.findOne({ name, userId });
};

/**
 * Get a single task by ID
 */
const getTaskById = async (id) => {
    return await Task.findById(id);
};

/**
 * Update a task by ID
 */
const updateTask = async (id, updates) => {
    return await Task.findByIdAndUpdate(id, updates, { new: true });
};

/**
 * Delete a task by ID
 */
const deleteTask = async (id) => {
    return await Task.findByIdAndDelete(id);
};

// Service function to fetch daily time spent data
const getDailyTimeSpent = async (userId, startDate) => {
    try {
        // If no start date is provided, use the current week's start date
        const startOfWeek = startDate ? moment(startDate).startOf('week') : moment().startOf('week');
        const endOfWeek = startOfWeek.clone().endOf('week'); // End of the week (Sunday)

        // Find all tasks for the user within the selected week
        const tasks = await Task.find({
            userId: userId, // Filter by userId
            startDate: { $gte: startOfWeek.toDate() },
            dueDate: { $lte: endOfWeek.toDate() },
        });

        // Initialize an array to hold time spent per day (Mon-Sun)
        const timeSpentPerDay = [0, 0, 0, 0, 0, 0, 0];

        // Loop through tasks and calculate the time spent for each day of the week
        tasks.forEach(task => {
            const start = moment(task.startDate);
            const end = moment(task.dueDate);
            const totalHours = task.estimatedTime || 0; // Default to 0 if no estimated time

            // Calculate the total number of days the task spans
            const daysInTask = end.diff(start, 'days') + 1; // +1 to include the end date

            // Calculate the time spent per day
            const hoursPerDay = Math.ceil(totalHours / daysInTask); // Distribute the estimated time evenly across days

            // Loop through each day and add the hours spent, ensuring no more than 24 hours per day
            for (let day = start; day.isBefore(end, 'day'); day.add(1, 'day')) {
                const dayOfWeek = day.day(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                timeSpentPerDay[dayOfWeek] += Math.min(hoursPerDay, 24); // Ensure no more than 24 hours per day
            }

            // Add the remaining time for the last day (if any)
            const lastDayOfWeek = end.day();
            timeSpentPerDay[lastDayOfWeek] += Math.min(totalHours - (hoursPerDay * (daysInTask - 1)), 24);
        });

        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Time Spent (hours)',
                data: timeSpentPerDay,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 5,
            }],
        };
    } catch (error) {
        throw new Error('Error fetching daily time spent data');
    }
};

const getDashboardData = async (userId) => {
    try {
        // Convert userId to ObjectId using new
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Total time spent (sum of estimated time for completed tasks)
        const completedTasks = await Task.aggregate([
            { $match: { userId: userObjectId, status: 'Completed' } },
            { $group: { _id: null, totalTime: { $sum: '$estimatedTime' } } },
        ]);
        console.log('Completed Tasks:', completedTasks); // Debugging line

        const totalTimeSpent = completedTasks.length > 0 ? completedTasks[0].totalTime : 0;

        // Total estimated time (sum of estimated time for all tasks)
        const totalEstimatedTime = await Task.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, totalEstimatedTime: { $sum: '$estimatedTime' } } },
        ]);
        console.log('Total Estimated Time:', totalEstimatedTime); // Debugging line

        const totalEstimatedTimeValue = totalEstimatedTime.length > 0 ? totalEstimatedTime[0].totalEstimatedTime : 0;

        // Estimated time (percentage of completed vs total tasks)
        const totalTasks = await Task.countDocuments({ userId: userObjectId });
        const completedTasksCount = await Task.countDocuments({ userId: userObjectId, status: 'Completed' });
        console.log('Total Tasks:', totalTasks); // Debugging line
        console.log('Completed Tasks Count:', completedTasksCount); // Debugging line

        let estimatedTimePercentage = 0;
        if (totalTasks > 0) {
            estimatedTimePercentage = (completedTasksCount / totalTasks) * 100;
        }

        // Round to 2 decimal places
        estimatedTimePercentage = estimatedTimePercentage.toFixed(2);

        // Task breakdown (total number of tasks)
        const taskCount = await Task.countDocuments({ userId: userObjectId });

        return {
            totalTimeSpent,
            totalEstimatedTime: totalEstimatedTimeValue,
            estimatedTimePercentage,
            taskCount,
        };
    } catch (error) {
        console.error('Error occurred:', error); // Debugging line
        throw new Error('Error fetching dashboard data');
    }
};

const getTaskStatusCounts = async (userId) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('Fetching task counts for userId:', userId); // Debugging line

        // Aggregate tasks based on their status
        const taskStatusCounts = await Task.aggregate([
            { $match: { userId: userObjectId } }, // Match tasks by userId
            { $group: {
                _id: "$status", // Group tasks by their status
                count: { $sum: 1 }, // Count the number of tasks per status
            }},
        ]);

        console.log('Task Status Counts:', taskStatusCounts); // Debugging line

        // Initialize counts for each status
        const taskStatusData = {
            Todo: 0,
            'In Progress': 0,
            Completed: 0,
            Expired: 0,
        };

        // Populate the status counts from aggregation result
        taskStatusCounts.forEach(statusData => {
            if (statusData._id in taskStatusData) {
                taskStatusData[statusData._id] = statusData.count;
            }
        });

        return taskStatusData;
    } catch (error) {
        console.error('Error in getTaskStatusCounts:', error); // Debugging line
        throw new Error('Error fetching task status counts');
    }
};


module.exports = {
    createTask,
    getTasksByUser,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskByNameAndUser,
    getDailyTimeSpent,
    getDashboardData,
    getTaskStatusCounts,
    getTaskByUserId
};
