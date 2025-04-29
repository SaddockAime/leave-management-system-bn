// filepath: src/routes/reportRoutes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { ReportController } from '../controllers/reportController';

const router = Router();
const reportController = new ReportController();

router.get('/leave-by-department', authenticateToken, reportController.getLeaveByDepartment);
router.get('/leave-by-employee/:employeeId', authenticateToken, reportController.getLeaveByEmployee);
router.get('/leave-by-type', authenticateToken, reportController.getLeaveByType);
router.get('/leave-calendar', authenticateToken, reportController.getLeaveCalendar);
router.get('/export/csv', authenticateToken, reportController.exportToCsv);
router.get('/export/excel', authenticateToken, reportController.exportToExcel);

export default router;