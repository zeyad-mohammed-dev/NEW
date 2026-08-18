import { Router } from 'express';
import * as duaController from './dua.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as duaSchemas from './dua.validation.js';

const router = Router();

router.get('/', duaController.getDuas);
router.post('/', validationMiddleware(duaSchemas.createDuaSchema), duaController.createDua);
router.patch('/:id', validationMiddleware(duaSchemas.updateDuaSchema), duaController.updateDua);
router.delete('/:id', validationMiddleware(duaSchemas.idParamSchema), duaController.deleteDua);

export default router;