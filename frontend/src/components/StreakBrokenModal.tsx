import { useStreak } from "@/context/StreakContext";
import { AlertTriangle, X } from "lucide-react";

const StreakBrokenModal = () => {
  const { streakBroken, dismissStreakBroken, stats } = useStreak();

  if (!streakBroken) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl animate-scale-in">
        <button
          onClick={dismissStreakBroken}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-accent transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Streak Broken</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You missed yesterday's tasks. Don't worry — every champion has setbacks. 
            Start fresh today!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
            <div>
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalDaysDisciplined}</div>
              <div className="text-xs text-muted-foreground">Total Days</div>
            </div>
          </div>
          
          <button
            onClick={dismissStreakBroken}
            className="w-full py-3 px-4 rounded-xl bg-success text-success-foreground font-semibold hover:bg-success/90 transition-colors"
          >
            Start New Streak
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakBrokenModal;
