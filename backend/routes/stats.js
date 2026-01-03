const express = require('express');
const { getStats, getDetailedStats } = require('../controllers/statsController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All stats routes require authentication
router.use(authenticate);

// GET /api/stats - Get user's basic streak statistics
router.get('/', getStats);

// GET /api/stats/detailed - Get detailed analytics dashboard
router.get('/detailed', getDetailedStats);

module.exports = router;
