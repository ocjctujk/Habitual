import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Habit } from "./Habit";
import { UserStreak } from "./UserStreak";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  user_id!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column({ length: 255 })
  password_hash!: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relationships
  @OneToMany(() => Habit, (habit) => habit.user)
  habits!: Habit[];

  @OneToMany(() => UserStreak, (streak) => streak.user)
  streaks!: UserStreak[];
}
