import { useStreak } from "@/context/StreakContext";
import { Flame } from "lucide-react";

const StreakCounter = () => {
  const { stats, todayTasks } = useStreak();
  const hasCompletedToday = todayTasks.some(t => t.completed);
  
  // Add 1 to streak if user has completed at least one task today
  const displayStreak = hasCompletedToday ? stats.currentStreak + 1 : stats.currentStreak;

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      <div className="relative">
        <div 
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 transition-all duration-500 ${
            hasCompletedToday ? 'glow-success border-success/30' : ''
          }`}
        >
          <Flame 
            className={`w-10 h-10 transition-all duration-500 ${
              hasCompletedToday 
                ? 'text-success animate-streak-glow' 
                : 'text-muted-foreground'
            }`}
            fill={hasCompletedToday ? 'currentColor' : 'none'}
          />
          <div className="flex flex-col">
            <span className="text-4xl font-bold tracking-tight">
              {displayStreak}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              {displayStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>
        {hasCompletedToday && (
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse-success" />
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        {hasCompletedToday 
          ? "Keep it up! You're on fire 🔥" 
          : "Complete a task to extend your streak"
        }
      </p>
    </div>
  );
};

export default StreakCounter;
