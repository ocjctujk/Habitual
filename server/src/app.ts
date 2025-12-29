import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import habitRoutes from './routes/habitRoutes';
import habitLogRoutes from './routes/habitLogRoutes';
import streakRoutes from './routes/streakRoutes';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', habitLogRoutes);
app.use('/api/streaks', streakRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Habit Tracker API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log('✓ Database connected successfully');
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch((error) => {
        console.error('✗ Database connection error:', error);
        process.exit(1);
    });

export default app;
