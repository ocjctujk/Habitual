import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { UserStreak } from "../entities/UserStreak";

const streakRepository = AppDataSource.getRepository(UserStreak);

export const getUserStreaks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const streaks = await streakRepository.find({
      where: { user_id: userId },
      relations: ["habit"],
    });

    res.status(200).json(streaks);
  } catch (error) {
    console.error("Get streaks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHabitStreak = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const habit_id = req.params.habit_id as string;

    const streak = await streakRepository.findOne({
      where: { user_id: userId, habit_id },
      relations: ["habit"],
    });

    if (!streak) {
      res.status(404).json({ message: "Streak not found" });
      return;
    }

    res.status(200).json(streak);
  } catch (error) {
    console.error("Get habit streak error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
