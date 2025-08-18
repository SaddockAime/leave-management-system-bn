import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createOnboardingValidation,
  updateOnboardingValidation,
  getOnboardingByIdValidation,
  searchOnboardingsValidation,
  createOnboardingTaskValidation,
  updateOnboardingTaskValidation,
  getOnboardingTaskByIdValidation,
} from '../validations/onboardingValidations';

const router = Router();
const onboardingController = new OnboardingController();

// Onboarding Routes
router.post(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createOnboardingValidation),
  onboardingController.createOnboarding,
);

router.put(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateOnboardingValidation),
  onboardingController.updateOnboarding,
);

router.get(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getOnboardingByIdValidation),
  onboardingController.getOnboardingById,
);

router.get(
  '/',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchOnboardingsValidation),
  onboardingController.searchOnboardings,
);

// Onboarding Task Routes
router.post(
  '/tasks',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createOnboardingTaskValidation),
  onboardingController.createOnboardingTask,
);

router.put(
  '/tasks/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateOnboardingTaskValidation),
  onboardingController.updateOnboardingTask,
);

router.get(
  '/tasks/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getOnboardingTaskByIdValidation),
  onboardingController.getOnboardingTaskById,
);

export default router;
