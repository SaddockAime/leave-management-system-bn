import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { LeaveTypeController } from '../controllers/leaveTypeController';

const router = Router();
const leaveTypeController = new LeaveTypeController();

// All authenticated users can view leave types
router.get('/', 
  authenticateToken, 
  leaveTypeController.getAllLeaveTypes
);

router.get('/:id', 
  authenticateToken, 
  leaveTypeController.getLeaveTypeById
);

// Only admin can create leave types
router.post('/', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('accrualRate').isNumeric().withMessage('Accrual rate must be a number'),
    body('requiresDocumentation').isBoolean().withMessage('Requires documentation must be a boolean'),
    body('requiresApproval').isBoolean().withMessage('Requires approval must be a boolean'),
    body('maxDays').optional().isNumeric().withMessage('Max days must be a number'),
    body('maxConsecutiveDays').optional().isNumeric().withMessage('Max consecutive days must be a number'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
    body('color').optional().isString().withMessage('Color must be a string')
  ],
  validateRequest,
  leaveTypeController.createLeaveType
);

// Only admin can update leave types
router.put('/:id', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('accrualRate').optional().isNumeric().withMessage('Accrual rate must be a number'),
    body('requiresDocumentation').optional().isBoolean().withMessage('Requires documentation must be a boolean'),
    body('requiresApproval').optional().isBoolean().withMessage('Requires approval must be a boolean'),
    body('maxDays').optional().isNumeric().withMessage('Max days must be a number'),
    body('maxConsecutiveDays').optional().isNumeric().withMessage('Max consecutive days must be a number'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
    body('color').optional().isString().withMessage('Color must be a string')
  ],
  validateRequest,
  leaveTypeController.updateLeaveType
);

// Only admin can delete leave types
router.delete('/:id', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  leaveTypeController.deleteLeaveType
);

export default router;