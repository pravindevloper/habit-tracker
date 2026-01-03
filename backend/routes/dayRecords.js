const express = require('express');
const { 
  getDayRecords, 
  getTodayRecord, 
  getYesterdayRecord, 
  getCalendarData 
} = require('../controllers/dayRecordController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All day records routes require authentication
router.use(authenticate);

// GET /api/records - Get day records for a date range
router.get('/', getDayRecords);

// GET /api/records/today - Get today's record
router.get('/today', getTodayRecord);

// GET /api/records/yesterday - Get yesterday's record
router.get('/yesterday', getYesterdayRecord);

// GET /api/records/calendar - Get calendar data for heatmap
router.get('/calendar', getCalendarData);

module.exports = router;
