const DayRecord = require('../models/DayRecord');
const { format, subDays, startOfDay, endOfDay } = require('date-fns');
const { z } = require('zod');

// Validation schemas
const getRecordsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use yyyy-MM-dd').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use yyyy-MM-dd').optional(),
});

const getDayRecords = async (req, res) => {
  try {
    // Validate query parameters
    const validation = getRecordsSchema.safeParse(req.query);
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

    const { startDate, endDate } = validation.data;
    const userId = req.user._id;

    // Default to last 365 days if no dates provided
    const defaultStart = format(subDays(new Date(), 364), 'yyyy-MM-dd');
    const defaultEnd = format(new Date(), 'yyyy-MM-dd');

    const query = {
      userId,
      date: {
        $gte: startDate || defaultStart,
        $lte: endDate || defaultEnd
      }
    };

    const records = await DayRecord.find(query).sort({ date: 1 });

    res.json({
      success: true,
      data: { records }
    });
  } catch (error) {
    console.error('Get day records error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get day records'
      }
    });
  }
};

const getTodayRecord = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = format(new Date(), 'yyyy-MM-dd');

    const record = await DayRecord.findOne({ userId, date: today });

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    console.error('Get today record error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get today record'
      }
    });
  }
};

const getYesterdayRecord = async (req, res) => {
  try {
    const userId = req.user._id;
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const record = await DayRecord.findOne({ userId, date: yesterday });

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    console.error('Get yesterday record error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get yesterday record'
      }
    });
  }
};

const getCalendarData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 365 } = req.query;

    const startDate = format(subDays(new Date(), parseInt(days)), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');

    const records = await DayRecord.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Transform data for heatmap visualization
    const calendarData = records.map(record => {
      let level = 0; // 0 = no activity
      if (record.isSuccessful) {
        // Calculate intensity based on completion ratio
        const ratio = record.completedTaskCount / record.taskCount;
        if (ratio === 1) level = 4; // All tasks completed
        else if (ratio >= 0.75) level = 3;
        else if (ratio >= 0.5) level = 2;
        else if (ratio >= 0.25) level = 1;
      }
      
      return {
        date: record.date,
        level,
        count: record.completedTaskCount,
        taskCount: record.taskCount,
        isSuccessful: record.isSuccessful
      };
    });

    res.json({
      success: true,
      data: { calendarData }
    });
  } catch (error) {
    console.error('Get calendar data error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get calendar data'
      }
    });
  }
};

module.exports = {
  getDayRecords,
  getTodayRecord,
  getYesterdayRecord,
  getCalendarData
};
