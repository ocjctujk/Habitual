import React from 'react';
import type { Habit } from '../types';

interface HabitGridViewProps {
  habits: Habit[];
  logsMap: Record<string, Set<string>>; // habitId -> Set of date strings (YYYY-MM-DD)
  view: 'weekly' | 'monthly';
}

export const HabitGridView: React.FC<HabitGridViewProps> = ({ habits, logsMap, view }) => {
  const getDates = () => {
    const dates = [];
    const today = new Date();
    const count = view === 'weekly' ? 7 : 30;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const dates = getDates();

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logsMap[habitId]?.has(dateStr);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-left">
              <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 w-48 sticky left-0 bg-gray-50 dark:bg-gray-900 z-10">Habit</th>
              {dates.map(date => (
                <th key={date.toISOString()} className="p-2 text-center min-w-[40px]">
                  <div className="flex flex-col items-center">
                     <span className="text-xs text-gray-400 font-medium uppercase">
                       {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                     </span>
                     <span className={`text-sm font-bold mt-1 ${
                       date.toDateString() === new Date().toDateString()
                         ? 'text-primary-600 dark:text-primary-400'
                         : 'text-gray-700 dark:text-gray-300'
                     }`}>
                       {date.getDate()}
                     </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {habits.map(habit => (
              <tr key={habit.habit_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="p-4 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {habit.name}
                </td>
                {dates.map(date => {
                  const done = isCompleted(habit.habit_id, date);
                  return (
                    <td key={date.toISOString()} className="p-2 text-center">
                      <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                        done
                          ? 'bg-green-500 text-white shadow-sm scale-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-300 scale-90 opacity-50'
                      }`}>
                        {done && '✓'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
