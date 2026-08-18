import { Router } from 'express';
import * as ruleController from './rule.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as ruleSchemas from './rule.validation.js';

const router = Router();

router.get('/', ruleController.getRules);
router.get('/:id', ruleController.getRuleById);
router.post('/', validationMiddleware(ruleSchemas.createRuleSchema), ruleController.createRule);
router.patch('/:id', validationMiddleware(ruleSchemas.updateRuleSchema), ruleController.updateRule);
router.delete('/:id', validationMiddleware(ruleSchemas.idParamSchema), ruleController.deleteRule);

export default router;