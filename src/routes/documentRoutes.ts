import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import { 
  getDocumentByIdValidation,
  uploadDocumentValidation,
  getDocumentsByLeaveRequestValidation 
} from '../validations/documentValidations';
import { documentUpload } from '../config/multer';

const router = Router();
const documentController = new DocumentController();

// Upload document for leave request
router.post(
  '/upload/:leaveRequestId',
  authenticateToken,
  validateRequest(uploadDocumentValidation),
  documentUpload.single('document'),
  (req, res) => documentController.uploadDocument(req, res),
);

// Get document by ID
router.get(
  '/:id',
  authenticateToken,
  validateRequest(getDocumentByIdValidation),
  (req, res) => documentController.getDocumentById(req, res),
);

// Delete document
router.delete(
  '/:id',
  authenticateToken,
  authorize(['HR_MANAGER', 'ADMIN']),
  validateRequest(getDocumentByIdValidation),
  (req, res) => documentController.deleteDocument(req, res),
);

// Get documents for leave request
router.get(
  '/leave-request/:leaveRequestId',
  authenticateToken,
  validateRequest(getDocumentsByLeaveRequestValidation),
  (req, res) => documentController.getDocumentsByLeaveRequest(req, res),
);

export default router;
