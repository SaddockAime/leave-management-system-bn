import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { EmployeeController } from '../controllers/employeeController';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const employeeController = new EmployeeController();

// Self-onboarding - create own profile
router.post('/onboard',
  authenticateToken,
  [
    body('position').notEmpty().withMessage('Position is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('hireDate').optional().isDate().withMessage('Hire date must be a valid date')
  ],
  validateRequest,
  employeeController.createSelfProfile
);

// Only admin can create employee profiles for others
router.post('/',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  [
    body('authUserId').notEmpty().withMessage('Auth user ID is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('hireDate').optional().isDate().withMessage('Hire date must be a valid date'),
    body('managerId').optional()
  ],
  validateRequest,
  employeeController.createEmployeeProfile
);

// Get all employees - accessible by managers and admins
router.get('/',
  authenticateToken,
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']),
  employeeController.getAllEmployees
);

// Get employee by ID - managers can view their team, admins can view all
router.get('/:id',
  authenticateToken,
  employeeController.getEmployeeById
);

// Update employee - only admins can update employee profiles
router.put('/:id',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('position').optional().notEmpty().withMessage('Position cannot be empty'),
    body('departmentId').optional().notEmpty().withMessage('Department ID cannot be empty'),
    body('hireDate').optional().isDate().withMessage('Hire date must be a valid date'),
    body('managerId').optional(),
    body('profilePicture').optional()
  ],
  validateRequest,
  employeeController.updateEmployee
);

export default router;