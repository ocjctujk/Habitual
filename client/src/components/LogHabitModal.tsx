import { useState } from "react";
import { logsAPI } from "../services/api";

export const LogHabitModal = ({ habit, onClose, onSuccess }: any) => {
  const [value, setValue] = useState(habit.target || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await logsAPI.create({
        habit_id: habit.id,
        completion_date: new Date().toISOString().split("T")[0],
        status: "completed",
        actual_value: value ? parseFloat(value) : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("You already logged this habit today!");
        onClose();
      } else {
        alert("Failed to log habit");
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Complete {habit.name}?
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Great job keeping up with your habits!
        </p>

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
                onChange={(e) => setValue(e.target.value)}
              />
              <p className="text-xs text-center text-gray-400 mt-2">
                Target: {habit.target}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-success">
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
