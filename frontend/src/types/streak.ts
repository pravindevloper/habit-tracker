export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DayRecord {
  date: string;
  tasks: Task[];
  isSuccessful: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysDisciplined: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
