import { Router } from 'express';
import { getUserStreaks, getHabitStreak } from '../controllers/streakController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All streak routes are protected
router.use(authenticateToken);

/**
 * @openapi
 * /api/streaks:
 *   get:
 *     tags:
 *       - Streaks
 *     summary: Get all streaks
 *     description: Retrieve all streaks for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Streaks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getUserStreaks);

/**
 * @openapi
 * /api/streaks/habit/{habit_id}:
 *   get:
 *     tags:
 *       - Streaks
 *     summary: Get habit streak
 *     description: Retrieve streak information for a specific habit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habit_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Habit streak retrieved successfully
 *       404:
 *         description: Habit not found
 *       401:
 *         description: Unauthorized
 */
router.get('/habit/:habit_id', getHabitStreak);

export default router;
