const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  completed: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  date?: string;
}

export interface UpdateTaskRequest {
  completed: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysDisciplined: number;
}

export interface DetailedStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysDisciplined: number;
  weekly: {
    successful: number;
    total: number;
    completionRate: number;
  };
  monthly: {
    successful: number;
    total: number;
    completionRate: number;
  };
  yearly: {
    successful: number;
    total: number;
    completionRate: number;
  };
  recent: {
    successful: number;
    total: number;
    completionRate: number;
  };
  tasks: {
    totalCreated: number;
    totalCompleted: number;
    todayTotal: number;
    todayCompleted: number;
    completionRate: number;
  };
  bestMonth: {
    month: string;
    completionRate: number;
    totalDays: number;
    successfulDays: number;
  } | null;
  worstMonth: {
    month: string;
    completionRate: number;
    totalDays: number;
    successfulDays: number;
  } | null;
}

export interface DayRecord {
  _id: string;
  userId: string;
  date: string;
  isSuccessful: boolean;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarData {
  date: string;
  level: number; // 0-4 intensity for heatmap
  count: number; // tasks completed
  taskCount: number; // total tasks
  isSuccessful: boolean;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return this.request<{ user: AuthResponse['user'] }>('/auth/me');
  }

  async getTasks(date?: string): Promise<ApiResponse<{ tasks: Task[] }>> {
    const params = date ? `?date=${date}` : '';
    return this.request<{ tasks: Task[] }>(`/tasks${params}`);
  }

  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<{ task: Task }>> {
    return this.request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<ApiResponse<{ task: Task }>> {
    return this.request<{ task: Task }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<ApiResponse<{ stats: StreakStats }>> {
    return this.request<{ stats: StreakStats }>('/stats');
  }

  async getDetailedStats(): Promise<ApiResponse<{ detailedStats: DetailedStats }>> {
    return this.request<{ detailedStats: DetailedStats }>('/stats/detailed');
  }

  async getDayRecords(startDate?: string, endDate?: string): Promise<ApiResponse<{ records: DayRecord[] }>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    
    return this.request<{ records: DayRecord[] }>(`/records${queryString ? `?${queryString}` : ''}`);
  }

  async getTodayRecord(): Promise<ApiResponse<{ record: DayRecord | null }>> {
    return this.request<{ record: DayRecord | null }>('/records/today');
  }

  async getYesterdayRecord(): Promise<ApiResponse<{ record: DayRecord | null }>> {
    return this.request<{ record: DayRecord | null }>('/records/yesterday');
  }

  async getCalendarData(days?: number): Promise<ApiResponse<{ calendarData: CalendarData[] }>> {
    const params = days ? `?days=${days}` : '';
    return this.request<{ calendarData: CalendarData[] }>(`/records/calendar${params}`);
  }
}

export const apiClient = new ApiClient();
