// filepath: src/routes/leaveTypeRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';
import { LeaveTypeController } from '../controllers/leaveTypeController';

const router = Router();
const leaveTypeController = new LeaveTypeController();

router.get('/', authenticateToken, leaveTypeController.getAllLeaveTypes);
router.get('/:id', authenticateToken, leaveTypeController.getLeaveTypeById);
router.post('/', 
  authenticateToken, 
  [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('accrualRate').isNumeric(),
    body('requiresDocumentation').isBoolean(),
    body('requiresApproval').isBoolean()
  ],
  validateRequest,
  leaveTypeController.createLeaveType
);
router.put('/:id', authenticateToken, leaveTypeController.updateLeaveType);
router.delete('/:id', authenticateToken, leaveTypeController.deleteLeaveType);

export default router;