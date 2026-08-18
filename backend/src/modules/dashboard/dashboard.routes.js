import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/summary', dashboardController.getSummary);
router.get('/stats', dashboardController.getStats);
router.get('/export', dashboardController.exportData);
router.post('/import', dashboardController.importData);
router.post('/reset', dashboardController.resetAll);

export default router;