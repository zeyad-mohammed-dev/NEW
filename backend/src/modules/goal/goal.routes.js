import { Router } from 'express';
import * as goalController from './goal.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as goalSchemas from './goal.validation.js';

const router = Router();

router.get('/active', goalController.getActiveGoal);
router.get('/history', goalController.getGoalsHistory);
router.post('/', validationMiddleware(goalSchemas.createGoalSchema), goalController.createGoal);
router.patch('/:id', validationMiddleware(goalSchemas.updateGoalSchema), goalController.updateGoal);
router.patch('/:id/complete', validationMiddleware(goalSchemas.idParamSchema), goalController.completeGoal);
router.delete('/:id', validationMiddleware(goalSchemas.idParamSchema), goalController.deleteGoal);

export default router;