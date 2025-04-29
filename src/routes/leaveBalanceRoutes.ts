// filepath: src/routes/leaveBalanceRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';
import { LeaveBalanceController } from '../controllers/leaveBalanceController';

const router = Router();
const leaveBalanceController = new LeaveBalanceController();

router.get('/my-balances', authenticateToken, leaveBalanceController.getMyLeaveBalances);
router.get('/employee/:employeeId', authenticateToken, leaveBalanceController.getEmployeeLeaveBalances);
router.post('/adjust',
  authenticateToken,
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