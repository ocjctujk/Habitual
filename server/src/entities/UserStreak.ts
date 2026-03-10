import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Habit } from "./Habit";

@Entity("user_streaks")
export class UserStreak {
  @PrimaryGeneratedColumn("uuid")
  streak_id!: string;

  @Column("uuid")
  user_id!: string;

  @Column("uuid")
  habit_id!: string;

  @Column({ type: "integer", default: 0 })
  current_streak!: number;

  @Column({ type: "integer", default: 0 })
  longest_streak!: number;

  @UpdateDateColumn()
  last_updated!: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.streaks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToOne(() => Habit, (habit) => habit.streak, { onDelete: "CASCADE" })
  @JoinColumn({ name: "habit_id" })
  habit!: Habit;
}
