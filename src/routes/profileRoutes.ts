import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import { updateProfileValidation } from '../validations/profileValidations';
import { profilePictureUpload } from '../config/multer';

const router = Router();
const profileController = new ProfileController();

// Get current user's profile
router.get('/', authenticateToken, (req, res) => profileController.getUserProfile(req, res));

// Update current user's profile (unified - handles both data and picture)
router.put(
  '/',
  authenticateToken,
  profilePictureUpload.single('profilePicture'),
  validateRequest(updateProfileValidation),
  (req, res) => profileController.updateProfile(req, res),
);

// Delete profile picture only
router.delete('/picture', authenticateToken, (req, res) =>
  profileController.deleteProfilePicture(req, res),
);

export default router;
