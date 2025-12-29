import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Habit } from './Habit';

export enum LogStatus {
    COMPLETED = 'completed',
    PARTIAL = 'partial',
    SKIPPED = 'skipped',
}

@Entity('habit_logs')
export class HabitLog {
    @PrimaryGeneratedColumn('uuid')
    log_id!: string;

    @Column('uuid')
    habit_id!: string;

    @Column({ type: 'date' })
    completion_date!: Date;

    @Column({
        type: 'enum',
        enum: LogStatus,
        default: LogStatus.COMPLETED,
    })
    status!: LogStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    actual_value?: number;

    // Relationships
    @ManyToOne(() => Habit, (habit) => habit.logs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'habit_id' })
    habit!: Habit;
}
