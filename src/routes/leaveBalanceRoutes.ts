import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { LeaveBalanceController } from '../controllers/leaveBalanceController';

const router = Router();
const leaveBalanceController = new LeaveBalanceController();

// All users can see their own leave balances
router.get('/my-balances', 
  authenticateToken, 
  leaveBalanceController.getMyLeaveBalances
);

// Only managers and admins can view employee leave balances
router.get('/employee/:employeeId', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']), 
  leaveBalanceController.getEmployeeLeaveBalances
);

// Only admins can adjust leave balances
router.post('/adjust',
  authenticateToken,
  authorize(['ROLE_ADMIN']),
  [
    body('employeeId').notEmpty(),
    body('leaveTypeId').notEmpty(),
    body('adjustment').isNumeric(),
    body('reason').notEmpty()
  ],
  validateRequest,
  leaveBalanceController.adjustLeaveBalance
);

export default router;