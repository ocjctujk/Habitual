import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { HabitLog } from './HabitLog';
import { UserStreak } from './UserStreak';

export enum Frequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

@Entity('habits')
export class Habit {
    @PrimaryGeneratedColumn('uuid')
    habit_id!: string;

    @Column('uuid')
    user_id!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'uuid', nullable: true })
    category_id?: string;

    @Column({
        type: 'enum',
        enum: Frequency,
        default: Frequency.DAILY,
    })
    frequency!: Frequency;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    target_value?: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @ManyToOne(() => User, (user) => user.habits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Category, (category) => category.habits, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'category_id' })
    category?: Category;

    @OneToMany(() => HabitLog, (log) => log.habit)
    logs!: HabitLog[];

    @OneToOne(() => UserStreak, (streak) => streak.habit)
    streak!: UserStreak;
}
