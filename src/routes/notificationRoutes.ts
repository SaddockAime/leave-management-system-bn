import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import { 
  notificationIdValidation,
  getUserNotificationsValidation,
  updateNotificationPreferencesValidation 
} from '../validations/notificationValidations';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get(
  '/my-notifications', 
  validateRequest(getUserNotificationsValidation),
  (req, res) => notificationController.getUserNotifications(req, res)
);

// Mark notification as read
router.put(
  '/:id/read', 
  validateRequest(notificationIdValidation),
  (req, res) => notificationController.markNotificationAsRead(req, res)
);

// Mark all notifications as read
router.put('/mark-all-read', (req, res) => notificationController.markAllNotificationsAsRead(req, res));

// Delete notification
router.delete(
  '/:id', 
  validateRequest(notificationIdValidation),
  (req, res) => notificationController.deleteNotification(req, res)
);

// Get notification preferences
router.get('/preferences', (req, res) => notificationController.getNotificationPreferences(req, res));

// Update notification preferences
router.put(
  '/preferences', 
  validateRequest(updateNotificationPreferencesValidation),
  (req, res) => notificationController.updateNotificationPreferences(req, res)
);

export default router;
