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

router.post('/', createHabit);
router.get('/', getUserHabits);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;
