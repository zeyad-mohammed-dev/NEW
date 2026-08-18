import { Router } from 'express';
import * as habitController from './habit.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as habitSchemas from './habit.validation.js';

const router = Router();

router.get('/today', habitController.getTodayHabits);
router.get('/history', habitController.getHistory);
router.get('/stars', habitController.getStars);
router.get('/day/:date', habitController.getDayDetail);
router.get('/', habitController.getHabits);
router.patch('/reorder', habitController.reorderHabits);
router.post('/', validationMiddleware(habitSchemas.createHabitSchema), habitController.createHabit);
router.patch('/:id', validationMiddleware(habitSchemas.updateHabitSchema), habitController.updateHabit);
router.delete('/:id', validationMiddleware(habitSchemas.idParamSchema), habitController.deleteHabit);
router.patch('/:id/complete', validationMiddleware(habitSchemas.idParamSchema), habitController.toggleComplete);

export default router;