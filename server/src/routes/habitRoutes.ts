import { Router } from 'express';
import {
    createHabit,
    getUserHabits,
    getHabitById,
    updateHabit,
    deleteHabit,
} from '../controllers/habitController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All habit routes are protected
router.use(authenticateToken);

/**
 * @openapi
 * /api/habits:
 *   post:
 *     tags:
 *       - Habits
 *     summary: Create a new habit
 *     description: Create a new habit for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - frequency
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *               frequency:
 *                 type: string
 *               goal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Habit created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags:
 *       - Habits
 *     summary: Get all habits
 *     description: Retrieve all habits for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Habits retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', createHabit);
router.get('/', getUserHabits);

/**
 * @openapi
 * /api/habits/{id}:
 *   get:
 *     tags:
 *       - Habits
 *     summary: Get habit by ID
 *     description: Retrieve a specific habit by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Habit retrieved successfully
 *       404:
 *         description: Habit not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - Habits
 *     summary: Update habit
 *     description: Update a specific habit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *               goal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Habit updated successfully
 *       404:
 *         description: Habit not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Habits
 *     summary: Delete habit
 *     description: Delete a specific habit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Habit deleted successfully
 *       404:
 *         description: Habit not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;
