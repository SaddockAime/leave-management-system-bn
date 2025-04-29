// filepath: src/routes/leaveRequestRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';
import { LeaveRequestController } from '../controllers/leaveRequestController';

const router = Router();
const leaveRequestController = new LeaveRequestController();

router.get('/my-leaves', authenticateToken, leaveRequestController.getMyLeaves);
router.get('/team-leaves', authenticateToken, leaveRequestController.getTeamLeaves);
router.get('/:id', authenticateToken, leaveRequestController.getLeaveRequestById);
router.post('/',
  authenticateToken,
  [
    body('leaveTypeId').notEmpty(),
    body('startDate').isDate(),
    body('endDate').isDate(),
    body('reason').optional()
  ],
  validateRequest,
  leaveRequestController.createLeaveRequest
);
router.put('/:id/approve', authenticateToken, leaveRequestController.approveLeaveRequest);
router.put('/:id/reject', authenticateToken, leaveRequestController.rejectLeaveRequest);
router.put('/:id/cancel', authenticateToken, leaveRequestController.cancelLeaveRequest);

export default router;