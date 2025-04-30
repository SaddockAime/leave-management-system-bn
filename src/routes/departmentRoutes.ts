import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { DepartmentController } from '../controllers/departmentController';

const router = Router();
const departmentController = new DepartmentController();

// Get all departments - accessible by all authenticated users
router.get('/', 
  authenticateToken, 
  departmentController.getAllDepartments
);

// Get department by ID
router.get('/:id', 
  authenticateToken, 
  departmentController.getDepartmentById
);

// Create department - admin only
router.post('/',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  [
    body('name').notEmpty().withMessage('Department name is required'),
    body('description').optional(),
    body('managerId').optional()
  ],
  validateRequest,
  departmentController.createDepartment
);

// Update department - admin only
router.put('/:id',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  [
    body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
    body('description').optional(),
    body('managerId').optional()
  ],
  validateRequest,
  departmentController.updateDepartment
);

// Delete department - admin only
router.delete('/:id',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  departmentController.deleteDepartment
);

export default router;