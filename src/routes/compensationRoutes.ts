import { Router } from 'express';
import { CompensationController } from '../controllers/compensationController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createSalaryValidation,
  updateSalaryValidation,
  getSalaryByIdValidation,
  searchSalariesValidation,
  createBenefitValidation,
  updateBenefitValidation,
  getBenefitByIdValidation,
  searchBenefitsValidation,
  assignBenefitToEmployeeValidation,
  updateEmployeeBenefitValidation,
  createBonusValidation,
  updateBonusValidation,
  getBonusByIdValidation,
  searchBonusesValidation,
} from '../validations/compensationValidations';

const router = Router();
const compensationController = new CompensationController();

// Salary Routes
router.post(
  '/salaries',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createSalaryValidation),
  compensationController.createSalary,
);

router.put(
  '/salaries/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateSalaryValidation),
  compensationController.updateSalary,
);

router.get(
  '/salaries/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getSalaryByIdValidation),
  compensationController.getSalaryById,
);

router.get(
  '/salaries',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchSalariesValidation),
  compensationController.searchSalaries,
);

// Benefit Routes
router.post(
  '/benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createBenefitValidation),
  compensationController.createBenefit,
);

router.put(
  '/benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateBenefitValidation),
  compensationController.updateBenefit,
);

router.get(
  '/benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getBenefitByIdValidation),
  compensationController.getBenefitById,
);

router.get(
  '/benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchBenefitsValidation),
  compensationController.searchBenefits,
);

// Employee Benefit Routes
router.post(
  '/employee-benefits',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(assignBenefitToEmployeeValidation),
  compensationController.assignBenefitToEmployee,
);

router.put(
  '/employee-benefits/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateEmployeeBenefitValidation),
  compensationController.updateEmployeeBenefit,
);

// Bonus Routes
router.post(
  '/bonuses',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createBonusValidation),
  compensationController.createBonus,
);

router.put(
  '/bonuses/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateBonusValidation),
  compensationController.updateBonus,
);

router.get(
  '/bonuses/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getBonusByIdValidation),
  compensationController.getBonusById,
);

router.get(
  '/bonuses',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchBonusesValidation),
  compensationController.searchBonuses,
);

export default router;
