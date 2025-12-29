import { Router } from 'express';
import {
    logHabit,
    getHabitLogs,
    updateHabitLog,
    deleteHabitLog,
} from '../controllers/habitLogController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All log routes are protected
router.use(authenticateToken);

router.post('/', logHabit);
router.get('/habit/:habit_id', getHabitLogs);
router.put('/:id', updateHabitLog);
router.delete('/:id', deleteHabitLog);

export default router;
