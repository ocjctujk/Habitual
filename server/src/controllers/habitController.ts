import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Habit } from "../entities/Habit";
import { UserStreak } from "../entities/UserStreak";

const habitRepository = AppDataSource.getRepository(Habit);
const streakRepository = AppDataSource.getRepository(UserStreak);

export const createHabit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { name, description, category_id, frequency, target_value } =
      req.body;

    if (!name) {
      res.status(400).json({ message: "Habit name is required" });
      return;
    }

    const habit = habitRepository.create({
      user_id: userId,
      name,
      description,
      category_id,
      frequency,
      target_value,
      is_active: true,
    });

    await habitRepository.save(habit);

    // Create initial streak record
    const streak = streakRepository.create({
      user_id: userId,
      habit_id: habit.habit_id,
      current_streak: 0,
      longest_streak: 0,
    });

    await streakRepository.save(streak);

    res.status(201).json({
      message: "Habit created successfully",
      habit,
    });
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserHabits = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { is_active } = req.query;

    const queryBuilder = habitRepository
      .createQueryBuilder("habit")
      .leftJoinAndSelect("habit.category", "category")
      .leftJoinAndSelect("habit.streak", "streak")
      .where("habit.user_id = :userId", { userId });

    if (is_active !== undefined) {
      queryBuilder.andWhere("habit.is_active = :is_active", {
        is_active: is_active === "true",
      });
    }

    const habits = await queryBuilder.getMany();

    res.status(200).json(habits);
  } catch (error) {
    console.error("Get habits error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHabitById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const habit = await habitRepository.findOne({
      where: { habit_id: id, user_id: userId },
      relations: ["category", "streak", "logs"],
    });

    if (!habit) {
      res.status(404).json({ message: "Habit not found" });
      return;
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error("Get habit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHabit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const {
      name,
      description,
      category_id,
      frequency,
      target_value,
      is_active,
    } = req.body;

    const habit = await habitRepository.findOne({
      where: { habit_id: id, user_id: userId },
    });

    if (!habit) {
      res.status(404).json({ message: "Habit not found" });
      return;
    }

    if (name) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (category_id !== undefined) habit.category_id = category_id;
    if (frequency) habit.frequency = frequency;
    if (target_value !== undefined) habit.target_value = target_value;
    if (is_active !== undefined) habit.is_active = is_active;

    await habitRepository.save(habit);

    res.status(200).json({
      message: "Habit updated successfully",
      habit,
    });
  } catch (error) {
    console.error("Update habit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHabit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const id = req.params.id as string;

    const habit = await habitRepository.findOne({
      where: { habit_id: id, user_id: userId },
    });

    if (!habit) {
      res.status(404).json({ message: "Habit not found" });
      return;
    }

    await habitRepository.remove(habit);

    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Delete habit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
