import { Router } from "express";
import {
  logHabit,
  getHabitLogs,
  updateHabitLog,
  deleteHabitLog,
} from "../controllers/habitLogController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All log routes are protected
router.use(authenticateToken);

/**
 * @openapi
 * /api/logs:
 *   post:
 *     tags:
 *       - Habit Logs
 *     summary: Log a habit completion
 *     description: Create a new log entry for a habit completion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - habit_id
 *               - logged_date
 *             properties:
 *               habit_id:
 *                 type: string
 *               logged_date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Habit logged successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", logHabit);

/**
 * @openapi
 * /api/logs/habit/{habit_id}:
 *   get:
 *     tags:
 *       - Habit Logs
 *     summary: Get habit logs
 *     description: Retrieve all log entries for a specific habit
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
 *         description: Habit logs retrieved successfully
 *       404:
 *         description: Habit not found
 *       401:
 *         description: Unauthorized
 */
router.get("/habit/:habit_id", getHabitLogs);

/**
 * @openapi
 * /api/logs/{id}:
 *   put:
 *     tags:
 *       - Habit Logs
 *     summary: Update habit log
 *     description: Update a specific habit log entry
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
 *               logged_date:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Habit log updated successfully
 *       404:
 *         description: Habit log not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Habit Logs
 *     summary: Delete habit log
 *     description: Delete a specific habit log entry
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
 *         description: Habit log deleted successfully
 *       404:
 *         description: Habit log not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", updateHabitLog);
router.delete("/:id", deleteHabitLog);

export default router;
