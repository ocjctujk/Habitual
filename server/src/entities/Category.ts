import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm';
import { Habit } from './Habit';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    category_id!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ length: 255, nullable: true })
    icon_url?: string;

    // Relationships
    @OneToMany(() => Habit, (habit) => habit.category)
    habits!: Habit[];
}
