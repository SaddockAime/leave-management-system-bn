import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  getLeaveByDepartmentValidation,
  getLeaveByEmployeeValidation,
  getLeaveByTypeValidation,
  getLeaveCalendarValidation,
  exportToCsvValidation,
  exportToExcelValidation,
} from '../validations/reportValidations';

const router = Router();
const reportController = new ReportController();

// Get leave by department (HR/Admin/Manager only)
router.get(
  '/leave-by-department',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getLeaveByDepartmentValidation),
  reportController.getLeaveByDepartment,
);

// Get leave by employee (HR/Admin/Manager only)
router.get(
  '/leave-by-employee/:employeeId',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getLeaveByEmployeeValidation),
  reportController.getLeaveByEmployee,
);

// Get leave by type (HR/Admin/Manager only)
router.get(
  '/leave-by-type',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getLeaveByTypeValidation),
  reportController.getLeaveByType,
);

// Get leave calendar (HR/Admin/Manager only)
router.get(
  '/leave-calendar',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN', 'MANAGER']),
  validateRequest(getLeaveCalendarValidation),
  reportController.getLeaveCalendar,
);

// Export to CSV (HR/Admin only)
router.get(
  '/export/csv',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(exportToCsvValidation),
  reportController.exportToCsv,
);

// Export to Excel (HR/Admin only)
router.get(
  '/export/excel',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(exportToExcelValidation),
  reportController.exportToExcel,
);

export default router;
