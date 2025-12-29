import React from 'react';
import type { Habit, UserStreak, Category } from '../types';

interface HabitCardProps {
  habit: Habit;
  streak?: UserStreak;
  category?: Category;
  isCompletedToday: boolean;
  onCheckIn: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak,
  category,
  isCompletedToday,
  onCheckIn,
  onDelete,
  onViewHistory,
}) => {
  return (
    <div className={`group rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col relative
      ${isCompletedToday
        ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:-translate-y-1'
      }`}
    >
      {/* Options */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
          title="History"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="flex gap-3 mb-4 pr-16">
        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xl transition-colors
          ${isCompletedToday
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {isCompletedToday ? '✓' : (
             category?.icon_url ? <img src={category.icon_url} alt="" className="h-6 w-6" /> : <span>{habit.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3 className={`font-bold text-lg leading-tight ${isCompletedToday ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
            {habit.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category?.name || 'General'}</p>
        </div>
      </div>

      <div className="mb-4">
         <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
           ${isCompletedToday
             ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
             : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
           }`}
         >
           {habit.frequency}
         </span>
      </div>

      {/* Progress / Target */}
      {habit.target_value && !isCompletedToday && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Goal</span>
            <span className="font-semibold">{habit.target_value}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div className="h-full bg-primary-500 rounded-full w-0"></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`mt-auto pt-4 border-t ${isCompletedToday ? 'border-green-100 dark:border-green-900/30' : 'border-gray-50 dark:border-gray-700'}`}>
        {!isCompletedToday ? (
          <div className="flex justify-between items-center mb-4">
             <div className="text-center">
                <p className="text-xs text-gray-400 uppercase font-bold">Streak</p>
                <p className="text-xl font-bold text-orange-500 flex items-center gap-1 justify-center">
                  {streak?.current_streak || 0} <span className="text-sm">🔥</span>
                </p>
             </div>
             <button
              onClick={onCheckIn}
              className="flex-1 ml-4 py-2.5 bg-gray-900 dark:bg-gray-700 border-transparent rounded-xl shadow-sm text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600 active:scale-95 transition-all"
            >
              Check-in
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
             <div className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-2">
               <span>Done for today!</span>
               <span className="text-lg">🎉</span>
             </div>
             <div className="text-right">
                <p className="text-xs text-green-600/70 dark:text-green-400/70 font-bold uppercase tracking-wider">Streak</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {streak?.current_streak || 0}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
