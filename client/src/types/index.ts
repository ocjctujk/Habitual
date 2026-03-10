export interface User {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  icon_url?: string;
}

export interface Habit {
  habit_id: string;
  user_id: string;
  name: string;
  description?: string;
  category_id?: string;
  frequency: "daily" | "weekly" | "monthly";
  target_value?: number;
  is_active: boolean;
  created_at: string;
  category?: Category;
  streak?: UserStreak;
  logs?: HabitLog[];
}

export interface HabitLog {
  log_id: string;
  habit_id: string;
  completion_date: string;
  status: "completed" | "partial" | "skipped";
  actual_value?: number;
}

export interface UserStreak {
  streak_id: string;
  user_id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_updated: string;
  habit?: Habit;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
