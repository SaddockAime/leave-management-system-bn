import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitmentController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  createJobPostingValidation,
  updateJobPostingValidation,
  publishJobPostingValidation,
  getJobPostingByIdValidation,
  searchJobPostingsValidation,
  createJobApplicationValidation,
  updateJobApplicationValidation,
  getJobApplicationByIdValidation,
  searchJobApplicationsValidation,
  createInterviewValidation,
  updateInterviewValidation,
  getInterviewByIdValidation,
  searchInterviewsValidation,
} from '../validations/recruitmentValidations';

const router = Router();
const recruitmentController = new RecruitmentController();

// Job Posting Routes
router.post(
  '/job-postings',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createJobPostingValidation),
  recruitmentController.createJobPosting,
);

router.put(
  '/job-postings/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateJobPostingValidation),
  recruitmentController.updateJobPosting,
);

router.post(
  '/job-postings/:id/publish',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(publishJobPostingValidation),
  recruitmentController.publishJobPosting,
);

router.get(
  '/job-postings/:id',
  authenticateToken,
  validateRequest(getJobPostingByIdValidation),
  recruitmentController.getJobPostingById,
);

router.get(
  '/job-postings',
  authenticateToken,
  validateRequest(searchJobPostingsValidation),
  recruitmentController.searchJobPostings,
);

// Job Application Routes
router.post(
  '/applications',
  authenticateToken,
  validateRequest(createJobApplicationValidation),
  recruitmentController.createJobApplication,
);

router.put(
  '/applications/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateJobApplicationValidation),
  recruitmentController.updateJobApplication,
);

router.get(
  '/applications/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getJobApplicationByIdValidation),
  recruitmentController.getJobApplicationById,
);

router.get(
  '/applications',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchJobApplicationsValidation),
  recruitmentController.searchApplications,
);

// Interview Routes
router.post(
  '/interviews',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(createInterviewValidation),
  recruitmentController.createInterview,
);

router.put(
  '/interviews/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(updateInterviewValidation),
  recruitmentController.updateInterview,
);

router.get(
  '/interviews/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getInterviewByIdValidation),
  recruitmentController.getInterviewById,
);

router.get(
  '/interviews',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(searchInterviewsValidation),
  recruitmentController.searchInterviews,
);

export default router;
