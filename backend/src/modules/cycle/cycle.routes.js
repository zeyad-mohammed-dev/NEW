import { Router } from 'express';
import * as cycleController from './cycle.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as cycleSchemas from './cycle.validation.js';

const router = Router();

// Cycle routes
router.get('/active', cycleController.getCurrentCycle);
router.get('/history', cycleController.getCycles);
router.post('/', validationMiddleware(cycleSchemas.createCycleSchema), cycleController.createCycle);
router.patch('/:id', validationMiddleware(cycleSchemas.updateCycleSchema), cycleController.updateCycle);
router.patch('/:id/complete', validationMiddleware(cycleSchemas.cycleIdParamSchema), cycleController.completeCycle);
router.patch('/:id/end', validationMiddleware(cycleSchemas.cycleIdParamSchema), cycleController.endCycle);
router.delete('/:id', validationMiddleware(cycleSchemas.cycleIdParamSchema), cycleController.deleteCycle);

// Task routes (nested under cycleId)
router.get('/:cycleId/tasks', cycleController.getCycleTasks);
router.post('/:cycleId/tasks', validationMiddleware(cycleSchemas.createTaskSchema), cycleController.createTask);
router.patch('/:cycleId/tasks/:taskId', validationMiddleware(cycleSchemas.updateTaskSchema), cycleController.updateTask);
router.patch('/:cycleId/tasks/:taskId/complete', validationMiddleware(cycleSchemas.taskIdParamSchema), cycleController.toggleTaskComplete);
router.delete('/:cycleId/tasks/:taskId', validationMiddleware(cycleSchemas.taskIdParamSchema), cycleController.deleteTask);

export default router;
