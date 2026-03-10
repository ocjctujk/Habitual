import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Habit } from "../entities/Habit";
import { HabitLog } from "../entities/HabitLog";
import { UserStreak } from "../entities/UserStreak";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || "habit_tracker",
  synchronize: process.env.NODE_ENV === "development", // Auto-create tables in dev
  logging: process.env.NODE_ENV === "development",
  entities: [User, Category, Habit, HabitLog, UserStreak],
  migrations: [],
  subscribers: [],
});
