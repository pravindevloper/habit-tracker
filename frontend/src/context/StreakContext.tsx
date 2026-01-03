import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Task, DayRecord, StreakStats, User } from "@/types/streak";
import { 
  apiClient, 
  AuthResponse, 
  Task as ApiTask, 
  StreakStats as ApiStreakStats,
  DayRecord as ApiDayRecord,
  CalendarData
} from "@/lib/api";
import { format, subDays } from "date-fns";

interface StreakContextType {
  user: User | null;
  isAuthenticated: boolean;
  todayTasks: Task[];
  yesterdayTasks: Task[];
  history: DayRecord[];
  stats: StreakStats;
  streakBroken: boolean;
  viewingYesterday: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addTask: (title: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  setViewingYesterday: (value: boolean) => void;
  dismissStreakBroken: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error("useStreak must be used within a StreakProvider");
  }
  return context;
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [streakBroken, setStreakBroken] = useState(false);
  const [viewingYesterday, setViewingYesterday] = useState(false);
  const [stats, setStats] = useState<StreakStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalDaysDisciplined: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and validate it
    const token = apiClient.getToken();
    if (token) {
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load tasks when user is authenticated
    if (user && !isLoading) {
      loadTasks();
      loadStats();
      loadDayRecords();
    }
  }, [user, isLoading]);

  const loadDayRecords = async () => {
    try {
      const response = await apiClient.getDayRecords();
      if (response.success && response.data) {
        const dayRecords = response.data.records.map(apiDayRecordToDayRecord);
        setHistory(dayRecords);
      }
    } catch (error) {
      console.error('Failed to load day records:', error);
    }
  };

  const apiDayRecordToDayRecord = (apiRecord: ApiDayRecord): DayRecord => ({
    date: apiRecord.date,
    tasks: [], // Tasks are loaded separately
    isSuccessful: apiRecord.isSuccessful
  });

  const loadStats = async () => {
    try {
      const response = await apiClient.getStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

      const [todayResponse, yesterdayResponse] = await Promise.all([
        apiClient.getTasks(today),
        apiClient.getTasks(yesterday)
      ]);

      if (todayResponse.success && todayResponse.data) {
        setTodayTasks(todayResponse.data.tasks.map(apiTaskToTask));
      }

      if (yesterdayResponse.success && yesterdayResponse.data) {
        setYesterdayTasks(yesterdayResponse.data.tasks.map(apiTaskToTask));
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const apiTaskToTask = (apiTask: ApiTask): Task => ({
    id: apiTask._id, // MongoDB returns _id
    title: apiTask.title,
    completed: apiTask.completed,
    createdAt: apiTask.createdAt
  });

  const validateToken = async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        const apiUser = response.data.user;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
        };
        setUser(user);
      } else {
        apiClient.setToken(null);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      apiClient.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.success && response.data) {
        const { user: apiUser, token } = response.data;
        apiClient.setToken(token);
        
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
        };
        setUser(user);
        
        // Initialize user data (will be implemented in next modules)
        setTodayTasks([]);
        setHistory([]);
        setStats({
          currentStreak: 0,
          longestStreak: 0,
          totalDaysDisciplined: 0,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await apiClient.register({ email, password, name });
      if (response.success && response.data) {
        const { user: apiUser, token } = response.data;
        apiClient.setToken(token);
        
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
        };
        setUser(user);
        
        // Initialize user data (will be implemented in next modules)
        setTodayTasks([]);
        setHistory([]);
        setStats({
          currentStreak: 0,
          longestStreak: 0,
          totalDaysDisciplined: 0,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setTodayTasks([]);
    setHistory([]);
    setStats({
      currentStreak: 0,
      longestStreak: 0,
      totalDaysDisciplined: 0,
    });
  };

  // Placeholder functions for next modules
  const addTask = async (title: string) => {
    try {
      const response = await apiClient.createTask({ title });
      if (response.success && response.data) {
        const newTask = apiTaskToTask(response.data.task);
        setTodayTasks(prev => [...prev, newTask]);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = todayTasks.find(t => t.id === taskId);
      if (task) {
        const response = await apiClient.updateTask(taskId, { completed: !task.completed });
        if (response.success && response.data) {
          const updatedTask = apiTaskToTask(response.data.task);
          setTodayTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
          // Reload stats and day records after task update
          loadStats();
          loadDayRecords();
        }
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await apiClient.deleteTask(taskId);
      if (response.success) {
        setTodayTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const dismissStreakBroken = () => {
    setStreakBroken(false);
  };

  return (
    <StreakContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        todayTasks,
        yesterdayTasks,
        history,
        stats,
        streakBroken,
        viewingYesterday,
        login,
        signup,
        logout,
        addTask,
        toggleTask,
        deleteTask,
        setViewingYesterday,
        dismissStreakBroken,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};
