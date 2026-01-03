const DayRecord = require('../models/DayRecord');
const Task = require('../models/Task');
const { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } = require('date-fns');

const calculateUserStats = async (userId) => {
  try {
    // Get all day records for the user
    const records = await DayRecord.find({ userId }).sort({ date: -1 });
    
    let currentStreak = 0;
    let longestStreak = 0;
    let totalDaysDisciplined = 0;
    let tempStreak = 0;

    // Exclude today from streak calculation - only count completed days up to yesterday
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Filter records to exclude today and only include dates up to yesterday
    const historicalRecords = records.filter(r => r.date <= yesterday);
    const sortedRecords = historicalRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak (starting from yesterday and going backwards)
    for (let i = 0; i < sortedRecords.length; i++) {
      if (sortedRecords[i].isSuccessful) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak and total days (also excluding today)
    for (const record of sortedRecords) {
      if (record.isSuccessful) {
        tempStreak++;
        totalDaysDisciplined++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalDaysDisciplined
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysDisciplined: 0
    };
  }
};

const getDetailedStatsData = async (userId) => {
  try {
    const records = await DayRecord.find({ userId }).sort({ date: -1 });
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Weekly stats (last 7 days including today)
    const weekStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    const weekRecords = records.filter(r => r.date >= weekStart && r.date <= today);
    const weekSuccessful = weekRecords.filter(r => r.isSuccessful).length;
    const weekCompletionRate = weekRecords.length > 0 ? (weekSuccessful / weekRecords.length) * 100 : 0;
    
    // Monthly stats (current month)
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const monthRecords = records.filter(r => r.date >= monthStart && r.date <= monthEnd);
    const monthSuccessful = monthRecords.filter(r => r.isSuccessful).length;
    const monthCompletionRate = monthRecords.length > 0 ? (monthSuccessful / monthRecords.length) * 100 : 0;
    
    // Yearly stats (current year)
    const yearStart = format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
    const yearRecords = records.filter(r => r.date >= yearStart);
    const yearSuccessful = yearRecords.filter(r => r.isSuccessful).length;
    const yearCompletionRate = yearRecords.length > 0 ? (yearSuccessful / yearRecords.length) * 100 : 0;
    
    // Task statistics
    const totalTasksCreated = tasks.length;
    const totalTasksCompleted = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(t => t.date === today);
    const todayTasksCompleted = todayTasks.filter(t => t.completed).length;
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const recentRecords = records.filter(r => r.date >= thirtyDaysAgo && r.date <= today);
    const recentSuccessful = recentRecords.filter(r => r.isSuccessful).length;
    const recentCompletionRate = recentRecords.length > 0 ? (recentSuccessful / recentRecords.length) * 100 : 0;
    
    // Best and worst months
    const monthlyStats = {};
    records.forEach(record => {
      const month = record.date.substring(0, 7); // yyyy-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = { total: 0, successful: 0 };
      }
      monthlyStats[month].total++;
      if (record.isSuccessful) {
        monthlyStats[month].successful++;
      }
    });
    
    const monthPerformance = Object.entries(monthlyStats).map(([month, stats]) => ({
      month,
      completionRate: (stats.successful / stats.total) * 100,
      totalDays: stats.total,
      successfulDays: stats.successful
    })).sort((a, b) => b.completionRate - a.completionRate);
    
    return {
      currentStreak: await calculateUserStats(userId).then(s => s.currentStreak),
      longestStreak: await calculateUserStats(userId).then(s => s.longestStreak),
      totalDaysDisciplined: await calculateUserStats(userId).then(s => s.totalDaysDisciplined),
      weekly: {
        successful: weekSuccessful,
        total: weekRecords.length,
        completionRate: Math.round(weekCompletionRate)
      },
      monthly: {
        successful: monthSuccessful,
        total: monthRecords.length,
        completionRate: Math.round(monthCompletionRate)
      },
      yearly: {
        successful: yearSuccessful,
        total: yearRecords.length,
        completionRate: Math.round(yearCompletionRate)
      },
      recent: {
        successful: recentSuccessful,
        total: recentRecords.length,
        completionRate: Math.round(recentCompletionRate)
      },
      tasks: {
        totalCreated: totalTasksCreated,
        totalCompleted: totalTasksCompleted,
        todayTotal: todayTasks.length,
        todayCompleted: todayTasksCompleted,
        completionRate: totalTasksCreated > 0 ? Math.round((totalTasksCompleted / totalTasksCreated) * 100) : 0
      },
      bestMonth: monthPerformance[0] || null,
      worstMonth: monthPerformance[monthPerformance.length - 1] || null
    };
  } catch (error) {
    console.error('Error calculating detailed stats:', error);
    return null;
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await calculateUserStats(userId);

    // Also return recent DayRecords for debugging
    const recentRecords = await DayRecord.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    res.json({
      success: true,
      data: { 
        stats,
        recentRecords: recentRecords.map(r => ({
          date: r.date,
          isSuccessful: r.isSuccessful,
          taskCount: r.taskCount,
          completedTaskCount: r.completedTaskCount
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get stats'
      }
    });
  }
};

const getDetailedStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const detailedStats = await getDetailedStatsData(userId);

    if (!detailedStats) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to calculate detailed stats'
        }
      });
    }

    res.json({
      success: true,
      data: { detailedStats }
    });
  } catch (error) {
    console.error('Get detailed stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get detailed stats'
      }
    });
  }
};

module.exports = {
  getStats,
  getDetailedStats,
  calculateUserStats
};
