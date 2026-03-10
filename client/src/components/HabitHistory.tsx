import React, { useEffect, useState } from "react";
import type { Habit, HabitLog } from "../types";
import { logsAPI } from "../services/api";
import { ConfirmModal } from "./ConfirmModal";

interface HabitHistoryProps {
  habit: Habit;
  onClose: () => void;
  onUpdate: () => void;
}

export const HabitHistory: React.FC<HabitHistoryProps> = ({
  habit,
  onClose,
  onUpdate,
}) => {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });

  useEffect(() => {
    loadLogs();
  }, [habit.habit_id]);

  const loadLogs = async () => {
    try {
      const response = await logsAPI.getByHabit(habit.habit_id);
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (logId: string) => {
    setConfirmModal({
      isOpen: true,
      id: logId,
    });
  };

  const handleDeleteLog = async () => {
    try {
      await logsAPI.delete(confirmModal.id);
      loadLogs();
      onUpdate();
      setConfirmModal({ isOpen: false, id: "" });
    } catch (error) {
      alert("Failed to delete log");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-slide-up flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {habit.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              History & Logs
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                No logs found yet.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Check in more often!
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.log_id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm
                    ${
                      log.status === "completed"
                        ? "bg-success-500"
                        : log.status === "partial"
                          ? "bg-warning-500"
                          : "bg-gray-400"
                    }`}
                  >
                    {log.status === "completed"
                      ? "✓"
                      : log.status === "partial"
                        ? "½"
                        : "✕"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(log.completion_date).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                    {log.actual_value && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Value:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {log.actual_value}
                        </span>
                        {habit.target_value && (
                          <span className="text-gray-400">
                            {" "}
                            / {habit.target_value}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => requestDelete(log.log_id)}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  Undo
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Undo Log"
        message="Are you sure you want to revert check-in for this day? Your streak might be affected."
        onConfirm={handleDeleteLog}
        onCancel={() => setConfirmModal({ isOpen: false, id: "" })}
        confirmText="Undo Check-in"
      />
    </div>
  );
};
