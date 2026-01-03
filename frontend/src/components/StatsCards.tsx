import { useStreak } from "@/context/StreakContext";
import { Flame, Trophy, Target, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { apiClient, DetailedStats } from "@/lib/api";
import { useState, useEffect } from "react";

const StatsCards = () => {
  const { stats, todayTasks } = useStreak();
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDetailedStats = async () => {
      try {
        const response = await apiClient.getDetailedStats();
        if (response.success && response.data) {
          setDetailedStats(response.data.detailedStats);
        }
      } catch (error) {
        console.error('Failed to load detailed stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedStats();
  }, []);

  const hasCompletedToday = todayTasks.some(t => t.completed);
  const displayStreak = hasCompletedToday ? stats.currentStreak + 1 : stats.currentStreak;
  const displayTotal = hasCompletedToday ? stats.totalDaysDisciplined + 1 : stats.totalDaysDisciplined;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card text-center animate-pulse">
            <div className="w-6 h-6 mx-auto mb-2 bg-muted rounded"></div>
            <div className="text-2xl font-bold mb-1 bg-muted rounded h-8 w-12 mx-auto"></div>
            <div className="text-xs text-muted-foreground bg-muted rounded h-4 w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  const basicCards = [
    {
      icon: Flame,
      label: "Current Streak",
      value: displayStreak,
      suffix: displayStreak === 1 ? "day" : "days",
      color: "text-success",
    },
    {
      icon: Trophy,
      label: "Longest Streak",
      value: Math.max(stats.longestStreak, displayStreak),
      suffix: stats.longestStreak === 1 ? "day" : "days",
      color: "text-yellow-500",
    },
    {
      icon: Target,
      label: "Total Disciplined",
      value: displayTotal,
      suffix: displayTotal === 1 ? "day" : "days",
      color: "text-blue-500",
    },
  ];

  const detailedCards = detailedStats ? [
    {
      icon: TrendingUp,
      label: "This Week",
      value: detailedStats.weekly.completionRate,
      suffix: "% complete",
      color: detailedStats.weekly.completionRate >= 80 ? "text-success" : 
              detailedStats.weekly.completionRate >= 50 ? "text-yellow-500" : "text-muted-foreground",
      subtitle: `${detailedStats.weekly.successful}/${detailedStats.weekly.total} days`
    },
    {
      icon: Calendar,
      label: "This Month",
      value: detailedStats.monthly.completionRate,
      suffix: "% complete",
      color: detailedStats.monthly.completionRate >= 80 ? "text-success" : 
              detailedStats.monthly.completionRate >= 50 ? "text-yellow-500" : "text-muted-foreground",
      subtitle: `${detailedStats.monthly.successful}/${detailedStats.monthly.total} days`
    },
    {
      icon: CheckCircle,
      label: "Task Completion",
      value: detailedStats.tasks.completionRate,
      suffix: "% done",
      color: detailedStats.tasks.completionRate >= 80 ? "text-success" : 
              detailedStats.tasks.completionRate >= 50 ? "text-yellow-500" : "text-muted-foreground",
      subtitle: `${detailedStats.tasks.totalCompleted}/${detailedStats.tasks.totalCreated} tasks`
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Streak Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {basicCards.map((card, index) => (
            <div 
              key={card.label}
              className="stat-card text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <card.icon className={`w-6 h-6 mx-auto mb-2 ${card.color}`} />
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.suffix}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Stats */}
      {detailedCards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
          <div className="grid grid-cols-3 gap-4">
            {detailedCards.map((card, index) => (
              <div 
                key={card.label}
                className="stat-card text-center animate-fade-in"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <card.icon className={`w-6 h-6 mx-auto mb-2 ${card.color}`} />
                <div className="text-2xl font-bold mb-1">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.suffix}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">
                  {card.label}
                </div>
                {card.subtitle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best/Worst Month */}
      {detailedStats?.bestMonth && detailedStats?.worstMonth && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
              <Trophy className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-lg font-bold mb-1">{detailedStats.bestMonth.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Best Month</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {new Date(detailedStats.bestMonth.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {detailedStats.bestMonth.successfulDays}/{detailedStats.bestMonth.totalDays} days
              </div>
            </div>
            
            <div className="stat-card text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
              <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold mb-1">{detailedStats.worstMonth.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Needs Improvement</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {new Date(detailedStats.worstMonth.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {detailedStats.worstMonth.successfulDays}/{detailedStats.worstMonth.totalDays} days
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;
