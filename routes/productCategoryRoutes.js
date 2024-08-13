import express from 'express';
import { createCategory, getCategories,getAllChildCategories ,deleteCategoryAndChildren,updateCategory} from '../Controller/productCategoryController.js';
import  {authenticateJWT,requireRole } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/categories/create',authenticateJWT,requireRole(['admin']), createCategory);

router.get('/categories/all',getCategories);

router.get('/categories/:id',authenticateJWT,requireRole(['admin']), getAllChildCategories);

router.delete('/categories/delete/:id',authenticateJWT,requireRole(['admin']),deleteCategoryAndChildren);

router.patch('/categories/update/:id',authenticateJWT,requireRole(['admin']), updateCategory);

export default router;