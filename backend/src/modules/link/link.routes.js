import { Router } from 'express';
import * as linkController from './link.controller.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as linkSchemas from './link.validation.js';

const router = Router();

// Category routes (before /:id to avoid conflict)
router.get('/categories', linkController.getCategories);
router.post('/categories', validationMiddleware(linkSchemas.createCategorySchema), linkController.createCategory);
router.patch('/categories/:id', validationMiddleware(linkSchemas.updateCategorySchema), linkController.updateCategory);
router.delete('/categories/:id', validationMiddleware(linkSchemas.idParamSchema), linkController.deleteCategory);

// Link routes
router.get('/', linkController.getLinks);
router.get('/:id', linkController.getLinkById);
router.post('/', validationMiddleware(linkSchemas.createLinkSchema), linkController.createLink);
router.patch('/:id', validationMiddleware(linkSchemas.updateLinkSchema), linkController.updateLink);
router.delete('/:id', validationMiddleware(linkSchemas.idParamSchema), linkController.deleteLink);

export default router;
