import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: { name: string; icon_url?: string }) =>
    api.post("/categories", data),
  update: (id: string, data: { name?: string; icon_url?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Habits API
export const habitsAPI = {
  getAll: (isActive?: boolean) =>
    api.get("/habits", { params: { is_active: isActive } }),
  getById: (id: string) => api.get(`/habits/${id}`),
  create: (data: {
    name: string;
    description?: string;
    category_id?: string;
    frequency: "daily" | "weekly" | "monthly";
    target_value?: number;
  }) => api.post("/habits", data),
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      category_id?: string;
      frequency?: "daily" | "weekly" | "monthly";
      target_value?: number;
      is_active?: boolean;
    },
  ) => api.put(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
};

// Logs API
export const logsAPI = {
  create: (data: {
    habit_id: string;
    completion_date: string;
    status: "completed" | "partial" | "skipped";
    actual_value?: number;
  }) => api.post("/logs", data),
  getByHabit: (
    habitId: string,
    params?: { start_date?: string; end_date?: string },
  ) => api.get(`/logs/habit/${habitId}`, { params }),
  update: (id: string, data: { status?: string; actual_value?: number }) =>
    api.put(`/logs/${id}`, data),
  delete: (id: string) => api.delete(`/logs/${id}`),
};

// Streaks API
export const streaksAPI = {
  getAll: () => api.get("/streaks"),
  getByHabit: (habitId: string) => api.get(`/streaks/habit/${habitId}`),
};

export default api;
