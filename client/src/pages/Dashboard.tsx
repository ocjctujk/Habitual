import React, { useState, useEffect } from "react";
import type { Habit, UserStreak, Category, HabitLog } from "../types";
import { habitsAPI, logsAPI, streaksAPI, categoriesAPI } from "../services/api";
import { CategoryManager } from "../components/CategoryManager";
import { HabitHistory } from "../components/HabitHistory";
import { ConfirmModal } from "../components/ConfirmModal";
import { HabitCard } from "../components/HabitCard";
import { HabitGridView } from "../components/HabitGridView";
import { CreateHabitModal } from "../components/CreateHabitModal";
import { LogHabitModal } from "../components/LogHabitModal";
import { StatCard } from "../components/StatCard";
import { Navbar } from "../components/Navbar";

export const Dashboard: React.FC = () => {
  // Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logsMap, setLogsMap] = useState<Record<string, Set<string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  // View State
  const [currentView, setCurrentView] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  // Modals state
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<{
    id: string;
    name: string;
    target?: number;
  } | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [viewHistoryHabit, setViewHistoryHabit] = useState<Habit | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Fetch Core Data
      const [habitsRes, streaksRes, catsRes] = await Promise.all([
        habitsAPI.getAll(true),
        streaksAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      const habitsData = habitsRes.data;
      setHabits(habitsData);
      setStreaks(streaksRes.data);
      setCategories(catsRes.data);

      // 2. Fetch Logs for History (Last 30 days)
      // Note: In a production app, we would paginate or use a specialized endpoint.
      // Here we fetch logs for each habit to build the history grid.
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const logsPromises = habitsData.map(
        (h: Habit) =>
          logsAPI
            .getByHabit(h.habit_id, {
              start_date: startDate.toISOString().split("T")[0],
              end_date: endDate.toISOString().split("T")[0],
            })
            .catch(() => ({ data: [] })), // Fail silently for individual habits
      );

      const logsResponses = await Promise.all(logsPromises);
      const newLogsMap: Record<string, Set<string>> = {};

      logsResponses.forEach((res: any, index) => {
        const habitId = habitsData[index].habit_id;
        newLogsMap[habitId] = new Set(
          res.data.map(
            (log: HabitLog) =>
              new Date(log.completion_date).toISOString().split("T")[0],
          ),
        );
      });

      setLogsMap(newLogsMap);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  // --- Actions ---

  const requestDeleteHabit = (habitId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Habit",
      message:
        "Are you sure you want to delete this habit? All progress and streaks will be lost forever.",
      onConfirm: () => handleDeleteHabit(habitId),
    });
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitsAPI.delete(habitId);
      refreshData();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      alert("Failed to delete habit");
    }
  };

  // --- Helpers ---
  const getStreak = (habitId: string) =>
    streaks.find((s) => s.habit_id === habitId);
  const getCategory = (catId?: string) =>
    categories.find((c) => c.category_id === catId);

  const isCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return logsMap[habitId]?.has(today) || false;
  };

  // Sort habits: Pending first, then Done
  const sortedHabits = [...habits].sort((a, b) => {
    const aDone = isCompletedToday(a.habit_id);
    const bDone = isCompletedToday(b.habit_id);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Actions Bar */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentView === "daily"
                ? "Today's Focus"
                : currentView === "weekly"
                  ? "This Week"
                  : "Monthly Overview"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="btn-secondary text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Manage Categories
            </button>
            <button
              onClick={() => setShowHabitModal(true)}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
            >
              <span className="text-xl">+</span> New Habit
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
            {(["daily", "weekly", "monthly"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === view
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* --- Content based on View --- */}

        {currentView === "daily" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard
                title="Active Habits"
                value={habits.length}
                icon="📝"
                color="bg-blue-500"
              />
              <StatCard
                title="Completed Today"
                value={
                  habits.filter((h) => isCompletedToday(h.habit_id)).length
                }
                icon="✓"
                color="bg-green-500"
              />
              <StatCard
                title="Current Streaks"
                value={streaks.filter((s) => s.current_streak > 0).length}
                icon="🔥"
                color="bg-orange-500"
              />
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHabits.map((habit) => (
                <HabitCard
                  key={habit.habit_id}
                  habit={habit}
                  streak={getStreak(habit.habit_id)}
                  category={getCategory(habit.category_id)}
                  isCompletedToday={isCompletedToday(habit.habit_id)}
                  onCheckIn={() =>
                    setShowLogModal({
                      id: habit.habit_id,
                      name: habit.name,
                      target: habit.target_value,
                    })
                  }
                  onDelete={() => requestDeleteHabit(habit.habit_id)}
                  onViewHistory={() => setViewHistoryHabit(habit)}
                />
              ))}

              {/* Add New Card (Empty State) */}
              <button
                onClick={() => setShowHabitModal(true)}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-300 min-h-[300px]"
              >
                <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-light">+</span>
                </div>
                <span className="font-semibold">Create New Habit</span>
              </button>
            </div>
          </>
        ) : (
          <HabitGridView habits={habits} logsMap={logsMap} view={currentView} />
        )}
      </main>

      {/* Modals */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onUpdate={refreshData}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
      {viewHistoryHabit && (
        <HabitHistory
          habit={viewHistoryHabit}
          onUpdate={refreshData}
          onClose={() => setViewHistoryHabit(null)}
        />
      )}

      {showHabitModal && (
        <CreateHabitModal
          categories={categories}
          onClose={() => setShowHabitModal(false)}
          onSuccess={refreshData}
        />
      )}
      {showLogModal && (
        <LogHabitModal
          habit={showLogModal}
          onClose={() => setShowLogModal(null)}
          onSuccess={refreshData}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
