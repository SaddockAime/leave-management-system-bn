import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's notifications
router.get('/', NotificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark a notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;