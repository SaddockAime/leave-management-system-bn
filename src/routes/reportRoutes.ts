import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { ReportController } from '../controllers/reportController';

const router = Router();
const reportController = new ReportController();

// Only managers and admins can access reports
router.get('/leave-by-department', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']), 
  reportController.getLeaveByDepartment
);

router.get('/leave-by-employee/:employeeId', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']), 
  reportController.getLeaveByEmployee
);

router.get('/leave-by-type', 
  authenticateToken, 
  authorize(['ROLE_MANAGER', 'ROLE_ADMIN']),
  reportController.getLeaveByType
);

router.get('/leave-calendar', 
  authenticateToken, 
  reportController.getLeaveCalendar  // Everyone can see the leave calendar
);

// Only admins can export data
router.get('/export/csv', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  reportController.exportToCsv
);

router.get('/export/excel', 
  authenticateToken, 
  authorize(['ROLE_ADMIN']), 
  reportController.exportToExcel
);

export default router;