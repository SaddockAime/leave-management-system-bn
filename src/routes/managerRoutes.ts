import { Router } from 'express';
import { ManagerController } from '../controllers/managerController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  getTeamMembersValidation,
  getTeamLeavesValidation,
  getTeamPerformanceValidation,
} from '../validations/managerValidations';

const router = Router();
const managerController = new ManagerController();

// Get team members
router.get(
  '/team-members',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getTeamMembersValidation),
  managerController.getTeamMembers,
);

// Get team leaves
router.get(
  '/team-leaves',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getTeamLeavesValidation),
  managerController.getTeamLeaves,
);

// Get team performance
router.get(
  '/team-performance',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  validateRequest(getTeamPerformanceValidation),
  managerController.getTeamPerformance,
);

// Approve leave request
router.post(
  '/leave-requests/:id/approve',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  managerController.approveLeaveRequest,
);

// Reject leave request
router.post(
  '/leave-requests/:id/reject',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  managerController.rejectLeaveRequest,
);

// Get team calendar
router.get(
  '/team-calendar',
  authenticateToken,
  authorize(['MANAGER', 'HR_MANAGER', 'ADMIN']),
  managerController.getTeamCalendar,
);

export default router;
