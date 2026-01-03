import { DayRecord, Task } from "@/types/streak";
import { format, subDays, startOfDay } from "date-fns";

const generateId = () => Math.random().toString(36).substr(2, 9);

const createTask = (title: string, completed: boolean): Task => ({
  id: generateId(),
  title,
  completed,
  createdAt: new Date().toISOString(),
});

// Generate mock completion history for the last 365 days
export const generateMockHistory = (): DayRecord[] => {
  const history: DayRecord[] = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < 365; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Random chance of having tasks and completing them
    const hasActivity = Math.random() > 0.3;
    const isSuccessful = hasActivity && Math.random() > 0.25;
    
    const tasks: Task[] = hasActivity
      ? [
          createTask("Morning meditation", isSuccessful),
          createTask("Read for 30 minutes", isSuccessful && Math.random() > 0.3),
          createTask("Exercise", isSuccessful && Math.random() > 0.4),
        ].filter(t => t.completed || Math.random() > 0.5)
      : [];

    history.push({
      date: dateStr,
      tasks,
      isSuccessful,
    });
  }

  return history;
};

export const mockTodayTasks: Task[] = [
  createTask("Morning meditation", false),
  createTask("Read for 30 minutes", false),
  createTask("Complete coding challenge", false),
];

export const calculateStreakStats = (history: DayRecord[]) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let totalDaysDisciplined = 0;
  let tempStreak = 0;

  // Sort by date descending (most recent first)
  const sorted = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak (starting from yesterday)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].isSuccessful) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak and total days
  for (const day of sorted) {
    if (day.isSuccessful) {
      tempStreak++;
      totalDaysDisciplined++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak, totalDaysDisciplined };
};

export const checkYesterdayMissed = (history: DayRecord[]): boolean => {
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const yesterdayRecord = history.find(d => d.date === yesterday);
  return yesterdayRecord ? !yesterdayRecord.isSuccessful : true;
};
