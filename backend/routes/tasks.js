const express = require('express');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks - Get tasks for a specific date
router.get('/', getTasks);

// POST /api/tasks - Create new task
router.post('/', createTask);

// PUT /api/tasks/:taskId - Update task (toggle completion)
router.put('/:taskId', updateTask);

// DELETE /api/tasks/:taskId - Delete task
router.delete('/:taskId', deleteTask);

module.exports = router;
