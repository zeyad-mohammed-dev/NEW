import express from 'express';
import cors from 'cors';
import path from 'path';

import habitRouter from './modules/habit/habit.routes.js';
import goalRouter from './modules/goal/goal.routes.js';
import cycleRouter from './modules/cycle/cycle.routes.js';
import duaRouter from './modules/dua/dua.routes.js';
import ruleRouter from './modules/rule/rule.routes.js';
import bigGoalRouter from './modules/big-goal/big-goal.routes.js';
import studyRouter from './modules/study/study.routes.js';
import linkRouter from './modules/link/link.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';

import connectDB from './db/connection.db.js';
import { successResponse } from './utils/response/response.js';
import {
  globalErrorHandler,
} from './middleware/error.middleware.js';
import { NODE_ENV, PORT } from './config/config.js';

export const bootstrap = async () => {
  const app = express();
  const port = PORT;

  // Database
  await connectDB();

  // Global Middlewares
  app.use(cors());
  app.use(express.json());

  // ====== API Routes (always available) ======
  app.use('/api/habits', habitRouter);
  app.use('/api/goals', goalRouter);
  app.use('/api/cycles', cycleRouter);
  app.use('/api/duas', duaRouter);
  app.use('/api/rules', ruleRouter);
  app.use('/api/big-goals', bigGoalRouter);
  app.use('/api/study', studyRouter);
  app.use('/api/links', linkRouter);
  app.use('/api/dashboard', dashboardRouter);

  // ====== Production: Serve Frontend ======
  if (NODE_ENV === 'production') {
    const frontendPath = process.env.FRONTEND_STATIC_PATH;
    app.use(express.static(frontendPath));

    // SPA fallback — any non-API GET request serves index.html
    app.get(/^(?!\/api\/)/, (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    // Dev health check
    app.get('/', (req, res) => {
      successResponse({ res, message: 'NEW App API is running' });
    });
  }

  // ====== API 404 Handler (only for /api/* routes) ======
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    });
  });

  // Global Error Handler
  app.use(globalErrorHandler);

  // Start Server
  const server = app.listen(port, () => {
    if (NODE_ENV !== 'production') {
      console.log(`Server listening on port ${port}`);
    }
  });

  return server;
};
