const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/createTasks/:userId', authMiddleware(), TaskController.createTask);
router.get('/getOptionTasks/:userId', authMiddleware(), TaskController.getTasks);
router.get('/getTasks/:id', authMiddleware(), TaskController.getTaskById);
router.put('/updateTasks/:id', authMiddleware(), TaskController.updateTask);
router.delete('/deleteTasks/:id', authMiddleware(), TaskController.deleteTask);
router.post('/suggest', authMiddleware(), TaskController.suggest_task);
router.get('/daily-time-spent/:userId', authMiddleware(), TaskController.getDailyTimeSpentData);
router.get('/dashboard/:userId', authMiddleware(), TaskController.getDashboard);
router.get('/task-status/:userId', authMiddleware(), TaskController.getTaskStatus);

router.post('/analyze-schedule', authMiddleware(), TaskController.analyze_schedule);
router.post('/ai-feedback/:userId', authMiddleware(), TaskController.getAIFeedback);
router.post('/chatbot-ask/:userId', authMiddleware(), TaskController.chatbotQNA);
router.post('/suggest-focus-time/:userId', authMiddleware(), TaskController.suggestFocusTime);

router.put('/update-expired-tasks/:userId', authMiddleware(), TaskController.updateExpiredTasks);

module.exports = router;
