import { Router } from 'express';
import { body, param } from 'express-validator';  // Add param import
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { LeaveRequestController } from '../controllers/leaveRequestController';

const router = Router();
const leaveRequestController = new LeaveRequestController();

// All staff can view their leaves
router.get('/my-leaves', 
  authenticateToken, 
  leaveRequestController.getMyLeaves
);

// Only admins can view all leaves across the organization
router.get('/admin/all-leaves', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  leaveRequestController.getAllLeaves
);

// Only managers and admins can view team leaves
router.get('/team-leaves', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']), 
  leaveRequestController.getTeamLeaves
);

// Only admins and managers can view leaves for a specific department
router.get('/department/:departmentId', 
  authenticateToken, 
  authorize(['ROLE_ADMIN', 'ROLE_MANAGER']),
  param('departmentId').isUUID().withMessage('Valid department ID is required'),  // Add validation
  validateRequest,
  leaveRequestController.getLeavesByDepartment
);

// Any authenticated user can view a specific leave request (access control is handled in controller)
router.get('/:id', 
  authenticateToken,
  param('id').isUUID().withMessage('Valid leave request ID is required'),  // Add validation
  validateRequest,
  leaveRequestController.getLeaveRequestById
);

// All staff can create leave requests
router.post('/',
  authenticateToken,
  [
    body('leaveTypeId').isUUID().withMessage('Valid leave type ID is required'),  // Improve validation
    body('startDate').isDate().withMessage('Start date must be a valid date'),
    body('endDate').isDate().withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty if provided')
  ],
  validateRequest,
  leaveRequestController.createLeaveRequest
);

// Only managers and admins can approve leave requests
router.put('/:id/approve', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']),
  param('id').isUUID().withMessage('Valid leave request ID is required'),  // Add validation
  body('comments').optional().trim(),
  validateRequest,
  leaveRequestController.approveLeaveRequest
);

// Only managers and admins can reject leave requests
router.put('/:id/reject', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']),
  param('id').isUUID().withMessage('Valid leave request ID is required'),  // Add validation
  body('comments').notEmpty().withMessage('Rejection reason is required'),  // Require comments for rejection
  validateRequest,
  leaveRequestController.rejectLeaveRequest
);

// Any user can cancel their own leave request (verification done in controller)
router.put('/:id/cancel', 
  authenticateToken,
  param('id').isUUID().withMessage('Valid leave request ID is required'),  // Add validation
  validateRequest,
  leaveRequestController.cancelLeaveRequest
);

export default router;