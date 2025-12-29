import { Router } from 'express';
import { getUserStreaks, getHabitStreak } from '../controllers/streakController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All streak routes are protected
router.use(authenticateToken);

router.get('/', getUserStreaks);
router.get('/habit/:habit_id', getHabitStreak);

export default router;
