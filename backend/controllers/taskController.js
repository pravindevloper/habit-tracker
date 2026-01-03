const Task = require('../models/Task');
const DayRecord = require('../models/DayRecord');
const { createTaskSchema, updateTaskSchema, getTasksSchema } = require('../utils/validation');
const { format } = require('date-fns');

// Helper function to update day record
const updateDayRecord = async (userId, date) => {
  try {
    const tasks = await Task.find({ userId, date });
    const taskCount = tasks.length;
    const completedTaskCount = tasks.filter(task => task.completed).length;
    // Only mark as successful if there are tasks and ALL are completed
    const isSuccessful = taskCount > 0 && completedTaskCount === taskCount;

    await DayRecord.findOneAndUpdate(
      { userId, date },
      {
        taskCount,
        completedTaskCount,
        isSuccessful,
        userId,
        date
      },
      { upsert: true, new: true }
    );

    return { taskCount, completedTaskCount, isSuccessful };
  } catch (error) {
    console.error('Error updating day record:', error);
    throw error;
  }
};

const getTasks = async (req, res) => {
  try {
    // Validate query parameters
    const validation = getTasksSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: validation.error.errors
        }
      });
    }

    const { date } = validation.data;
    const userId = req.user._id;
    
    // Default to today if no date provided
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    const tasks = await Task.find({ userId, date: targetDate }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get tasks'
      }
    });
  }
};

const createTask = async (req, res) => {
  try {
    // Validate request body
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: validation.error.errors
        }
      });
    }

    const { title, date } = validation.data;
    const userId = req.user._id;
    
    // Default to today if no date provided
    const targetDate = date || format(new Date(), 'yyyy-MM-dd');

    // Create task
    const task = new Task({
      userId,
      title: title.trim(),
      date: targetDate
    });

    await task.save();

    // Update day record
    await updateDayRecord(userId, targetDate);

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

const updateTask = async (req, res) => {
  try {
    // Validate request body
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: validation.error.errors
        }
      });
    }

    const { taskId } = req.params;
    const { completed } = validation.data;
    const userId = req.user._id;

    // Find and update task
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Update day record
    await updateDayRecord(userId, task.date);

    res.json({
      success: true,
      data: { task },
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update task'
      }
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Find and delete task
    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    // Update day record
    await updateDayRecord(userId, task.date);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete task'
      }
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
