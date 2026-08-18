import { Router } from 'express';
import * as bigGoalController from './big-goal.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as bigGoalSchemas from './big-goal.validation.js';

const router = Router();

router.get('/', bigGoalController.getBigGoals);
router.post('/', validationMiddleware(bigGoalSchemas.createBigGoalSchema), bigGoalController.createBigGoal);
router.patch('/:id', validationMiddleware(bigGoalSchemas.updateBigGoalSchema), bigGoalController.updateBigGoal);
router.delete('/:id', validationMiddleware(bigGoalSchemas.idParamSchema), bigGoalController.deleteBigGoal);

export default router;