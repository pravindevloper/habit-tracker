import { useStreak } from "@/context/StreakContext";
import { format, startOfWeek, addDays, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

const ContributionHeatmap = () => {
  const { history, todayTasks } = useStreak();
  
  // Generate calendar data for last 365 days
  const today = new Date();
  const startDate = subDays(today, 364);
  const weeks: Date[][] = [];
  
  // Start from the beginning of the week
  let currentDate = startOfWeek(startDate, { weekStartsOn: 0 });
  
  while (currentDate <= today) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
  }

  const getDayStatus = (date: Date): 'success' | 'empty' | 'future' => {
    if (date > today) return 'future';
    
    // Check if it's today
    if (isSameDay(date, today)) {
      const hasCompletedToday = todayTasks.some(t => t.completed);
      return hasCompletedToday ? 'success' : 'empty';
    }
    
    const dateStr = format(date, "yyyy-MM-dd");
    const record = history.find(d => d.date === dateStr);
    return record?.isSuccessful ? 'success' : 'empty';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate month labels positions
  const monthLabels: { month: string; position: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ month: months[month], position: weekIndex });
      lastMonth = month;
    }
  });

  return (
    <div className="w-full animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2 text-xs text-muted-foreground ml-8">
            {monthLabels.map((label, i) => (
              <span 
                key={i}
                className="absolute"
                style={{ marginLeft: `${label.position * 14}px` }}
              >
                {label.month}
              </span>
            ))}
          </div>
          
          <div className="flex gap-1 relative mt-6">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
              {days.map((day, i) => (
                <div 
                  key={day} 
                  className="h-[12px] flex items-center"
                  style={{ visibility: i % 2 === 0 ? 'hidden' : 'visible' }}
                >
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    const status = getDayStatus(day);
                    const isToday = isSameDay(day, today);
                    
                    return (
                      <div
                        key={dayIndex}
                        title={`${format(day, "MMM d, yyyy")} - ${
                          status === 'success' ? 'Completed' : 
                          status === 'future' ? 'Future' : 'No activity'
                        }`}
                        className={cn(
                          "w-[12px] h-[12px] heatmap-cell",
                          status === 'success' && "heatmap-cell-success",
                          status === 'empty' && "heatmap-cell-empty",
                          status === 'future' && "opacity-0",
                          isToday && "ring-1 ring-foreground/20"
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-[12px] h-[12px] rounded-sm bg-muted/50" />
              <div className="w-[12px] h-[12px] rounded-sm bg-success/40" />
              <div className="w-[12px] h-[12px] rounded-sm bg-success/60" />
              <div className="w-[12px] h-[12px] rounded-sm bg-success/80" />
              <div className="w-[12px] h-[12px] rounded-sm bg-success" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
