import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Habit, UserStreak, Category, HabitLog } from '../types';
import { habitsAPI, logsAPI, streaksAPI, categoriesAPI } from '../services/api';
import { CategoryManager } from '../components/CategoryManager';
import { HabitHistory } from '../components/HabitHistory';
import { ConfirmModal } from '../components/ConfirmModal';
import { HabitCard } from '../components/HabitCard';
import { HabitGridView } from '../components/HabitGridView';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Data State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logsMap, setLogsMap] = useState<Record<string, Set<string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  // View State
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Modals state
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<{ id: string, name: string, target?: number } | null>(null);
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
    title: '',
    message: '',
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
        categoriesAPI.getAll()
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

      const logsPromises = habitsData.map((h: Habit) =>
        logsAPI.getByHabit(h.habit_id, {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }).catch(() => ({ data: [] })) // Fail silently for individual habits
      );

      const logsResponses = await Promise.all(logsPromises);
      const newLogsMap: Record<string, Set<string>> = {};

      logsResponses.forEach((res: any, index) => {
        const habitId = habitsData[index].habit_id;
        newLogsMap[habitId] = new Set(res.data.map((log: HabitLog) =>
          new Date(log.completion_date).toISOString().split('T')[0]
        ));
      });

      setLogsMap(newLogsMap);

    } catch (error) {
      console.error('Failed to load data:', error);
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
      title: 'Delete Habit',
      message: 'Are you sure you want to delete this habit? All progress and streaks will be lost forever.',
      onConfirm: () => handleDeleteHabit(habitId),
    });
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitsAPI.delete(habitId);
      refreshData();
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      alert('Failed to delete habit');
    }
  };

  // --- Helpers ---
  const getStreak = (habitId: string) => streaks.find((s) => s.habit_id === habitId);
  const getCategory = (catId?: string) => categories.find((c) => c.category_id === catId);

  const isCompletedToday = (habitId: string) => {
      const today = new Date().toISOString().split('T')[0];
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
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Habitual</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Build your better self</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Logout"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Actions Bar */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
               {currentView === 'daily' ? "Today's Focus" : currentView === 'weekly' ? 'This Week' : 'Monthly Overview'}
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
             {(['daily', 'weekly', 'monthly'] as const).map((view) => (
               <button
                 key={view}
                 onClick={() => setCurrentView(view)}
                 className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                   currentView === view
                     ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                 }`}
               >
                 {view.charAt(0).toUpperCase() + view.slice(1)}
               </button>
             ))}
          </div>
        </div>

        {/* --- Content based on View --- */}

        {currentView === 'daily' ? (
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
                value={habits.filter(h => isCompletedToday(h.habit_id)).length}
                icon="✓"
                color="bg-green-500"
              />
              <StatCard
                title="Current Streaks"
                value={streaks.filter(s => s.current_streak > 0).length}
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
                  onCheckIn={() => setShowLogModal({ id: habit.habit_id, name: habit.name, target: habit.target_value })}
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
      {showCategoryManager && <CategoryManager categories={categories} onUpdate={refreshData} onClose={() => setShowCategoryManager(false)} />}
      {viewHistoryHabit && <HabitHistory habit={viewHistoryHabit} onUpdate={refreshData} onClose={() => setViewHistoryHabit(null)} />}

      {showHabitModal && <CreateHabitModal categories={categories} onClose={() => setShowHabitModal(false)} onSuccess={refreshData} />}
      {showLogModal && <LogHabitModal habit={showLogModal} onClose={() => setShowLogModal(null)} onSuccess={refreshData} />}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

// --- Subcomponents ---

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const CreateHabitModal = ({ categories, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target_value: '',
    category_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await habitsAPI.create({
        ...formData,
        target_value: formData.target_value ? parseFloat(formData.target_value) : undefined,
        category_id: formData.category_id || undefined,
      } as any);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Habit</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              required
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="e.g. Read Books"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
               <select
                 className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 value={formData.frequency}
                 onChange={e => setFormData({...formData, frequency: e.target.value})}
               >
                 <option value="daily">Daily</option>
                 <option value="weekly">Weekly</option>
                 <option value="monthly">Monthly</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
               <select
                 className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 value={formData.category_id}
                 onChange={e => setFormData({...formData, category_id: e.target.value})}
               >
                 <option value="">None</option>
                 {categories.map((c: any) => (
                   <option key={c.category_id} value={c.category_id}>{c.name}</option>
                 ))}
               </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target (Optional)</label>
             <input
               type="number"
               className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
               placeholder="e.g. 10"
               value={formData.target_value}
               onChange={e => setFormData({...formData, target_value: e.target.value})}
             />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Numeric goal (pages, minutes, glasses)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              className="input-field min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Why do you want to build this habit?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Creating...' : 'Create Habit'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LogHabitModal = ({ habit, onClose, onSuccess }: any) => {
  const [value, setValue] = useState(habit.target || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await logsAPI.create({
        habit_id: habit.id,
        completion_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        actual_value: value ? parseFloat(value) : undefined
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('You already logged this habit today!');
        onClose();
      } else {
        alert('Failed to log habit');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
       <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up text-center">
         <div className="h-16 w-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg ring-4 ring-success-100 dark:ring-success-900/50">
           ✓
         </div>
         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complete {habit.name}?</h3>
         <p className="text-gray-500 dark:text-gray-400 mb-6">Great job keeping up with your habits!</p>

         <form onSubmit={handleSubmit}>
           {habit.target && (
             <div className="mb-6 text-left">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Amount Completed
               </label>
               <input
                 type="number"
                 required
                 className="input-field text-center text-lg font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 value={value}
                 onChange={e => setValue(e.target.value)}
               />
               <p className="text-xs text-center text-gray-400 mt-2">Target: {habit.target}</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-3">
             <button type="button" onClick={onClose} className="btn-secondary dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
             <button type="submit" disabled={loading} className="btn-success">
               {loading ? 'Saving...' : 'Confirm'}
             </button>
           </div>
         </form>
       </div>
    </div>
  );
};
