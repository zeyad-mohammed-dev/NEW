import { Router } from 'express';
import * as studyController from './study.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import { createTaskSchema, updateTaskSchema, idParamSchema, logSessionSchema } from './study.validation.js';

const router = Router();

router.get('/stats', studyController.getStats);
router.get('/tasks', studyController.getAllTasks);
router.post('/tasks', validationMiddleware(createTaskSchema), studyController.createTask);
router.patch('/tasks/:id', validationMiddleware(updateTaskSchema), studyController.updateTask);
router.delete('/tasks/:id', validationMiddleware(idParamSchema), studyController.deleteTask);
router.post('/sessions', validationMiddleware(logSessionSchema), studyController.logSession);
router.get('/sessions/daily', studyController.getDailySessionCount);
router.get('/sessions/history', studyController.getSessionHistory);

export default router;