import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { HabitLog, LogStatus } from "../entities/HabitLog";
import { Habit } from "../entities/Habit";
import { UserStreak } from "../entities/UserStreak";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

const habitLogRepository = AppDataSource.getRepository(HabitLog);
const habitRepository = AppDataSource.getRepository(Habit);
const streakRepository = AppDataSource.getRepository(UserStreak);

export const logHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { habit_id, completion_date, status, actual_value } = req.body;

    if (!habit_id || !completion_date) {
      res.status(400).json({
        message: "Habit ID and completion date are required",
      });
      return;
    }

    // Verify habit belongs to user
    const habit = await habitRepository.findOne({
      where: { habit_id, user_id: userId },
    });

    if (!habit) {
      res.status(404).json({ message: "Habit not found" });
      return;
    }

    // Check if log already exists for this date
    const existingLog = await habitLogRepository.findOne({
      where: {
        habit_id,
        completion_date: new Date(completion_date),
      },
    });

    if (existingLog) {
      res.status(409).json({
        message: "Log already exists for this date. Use update instead.",
      });
      return;
    }

    const log = habitLogRepository.create({
      habit_id,
      completion_date: new Date(completion_date),
      status: status || LogStatus.COMPLETED,
      actual_value,
    });

    await habitLogRepository.save(log);

    // Update streak
    await updateStreak(habit_id, userId);

    res.status(201).json({
      message: "Habit logged successfully",
      log,
    });
  } catch (error) {
    console.error("Log habit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHabitLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const habit_id = req.params.habit_id as string;

    const { start_date, end_date } = req.query;

    // Verify habit belongs to user
    const habit = await habitRepository.findOne({
      where: { habit_id, user_id: userId },
    });

    if (!habit) {
      res.status(404).json({ message: "Habit not found" });
      return;
    }

    let logs;

    if (start_date && end_date) {
      logs = await habitLogRepository.find({
        where: {
          habit_id,
          completion_date: Between(
            new Date(start_date as string),
            new Date(end_date as string),
          ),
        },
        order: { completion_date: "DESC" },
      });
    } else if (start_date) {
      logs = await habitLogRepository.find({
        where: {
          habit_id,
          completion_date: MoreThanOrEqual(new Date(start_date as string)),
        },
        order: { completion_date: "DESC" },
      });
    } else if (end_date) {
      logs = await habitLogRepository.find({
        where: {
          habit_id,
          completion_date: LessThanOrEqual(new Date(end_date as string)),
        },
        order: { completion_date: "DESC" },
      });
    } else {
      logs = await habitLogRepository.find({
        where: { habit_id },
        order: { completion_date: "DESC" },
      });
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error("Get habit logs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHabitLog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { status, actual_value } = req.body;

    const log = await habitLogRepository.findOne({
      where: { log_id: id },
      relations: ["habit"],
    });

    if (!log) {
      res.status(404).json({ message: "Log not found" });
      return;
    }

    // Verify habit belongs to user
    if (log.habit.user_id !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (status) log.status = status;
    if (actual_value !== undefined) log.actual_value = actual_value;

    await habitLogRepository.save(log);

    // Update streak
    await updateStreak(log.habit_id, userId);

    res.status(200).json({
      message: "Log updated successfully",
      log,
    });
  } catch (error) {
    console.error("Update habit log error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHabitLog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const log = await habitLogRepository.findOne({
      where: { log_id: id },
      relations: ["habit"],
    });

    if (!log) {
      res.status(404).json({ message: "Log not found" });
      return;
    }

    // Verify habit belongs to user
    if (log.habit.user_id !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    const habitId = log.habit_id;
    await habitLogRepository.remove(log);

    // Update streak
    await updateStreak(habitId, userId);

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Delete habit log error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to calculate and update streaks
async function updateStreak(habitId: string, userId: string): Promise<void> {
  const logs = await habitLogRepository.find({
    where: { habit_id: habitId, status: LogStatus.COMPLETED },
    order: { completion_date: "DESC" },
  });

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (logs.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentLog = new Date(logs[0].completion_date);
    mostRecentLog.setHours(0, 0, 0, 0);

    // Calculate current streak
    if (
      mostRecentLog.getTime() === today.getTime() ||
      mostRecentLog.getTime() === yesterday.getTime()
    ) {
      let expectedDate = new Date(mostRecentLog);

      for (const log of logs) {
        const logDate = new Date(log.completion_date);
        logDate.setHours(0, 0, 0, 0);

        if (logDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 0; i < logs.length - 1; i++) {
      const current = new Date(logs[i].completion_date);
      current.setHours(0, 0, 0, 0);

      const next = new Date(logs[i + 1].completion_date);
      next.setHours(0, 0, 0, 0);

      const diffTime = current.getTime() - next.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  }

  // Update or create streak record
  let streak = await streakRepository.findOne({
    where: { habit_id: habitId, user_id: userId },
  });

  if (streak) {
    streak.current_streak = currentStreak;
    streak.longest_streak = Math.max(streak.longest_streak, longestStreak);
  } else {
    streak = streakRepository.create({
      user_id: userId,
      habit_id: habitId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    });
  }

  await streakRepository.save(streak);
}
