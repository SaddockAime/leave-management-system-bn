import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Notification, Employee } from '../models';

export class NotificationController {
  /**
   * Get all notifications for the current user
   */
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // First, find the employee record for this user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: user.id } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      
      // Get notifications for this employee
      const notificationRepository = getRepository(Notification);
      const notifications = await notificationRepository.find({
        where: { recipient: { id: employee.id } },
        relations: ['recipient'],
        order: { createdAt: 'DESC' }
      });
      
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  /**
   * Get unread notification count for the current user
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // First, find the employee record for this user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: user.id } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      
      // Count unread notifications
      const notificationRepository = getRepository(Notification);
      const unreadCount = await notificationRepository.count({
        where: { 
          recipient: { id: employee.id },
          read: false
        }
      });
      
      res.status(200).json({ count: unreadCount });
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  /**
   * Mark a notification as read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = req.params.id;
      const user = (req as any).user;
      
      if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // First, find the employee record for this user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: user.id } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      
      // Find the notification
      const notificationRepository = getRepository(Notification);
      const notification = await notificationRepository.findOne({
        where: { 
          id: notificationId,
          recipient: { id: employee.id }
        },
        relations: ['recipient']
      });
      
      if (!notification) {
        res.status(404).json({ message: 'Notification not found or you do not have permission to access it' });
        return;
      }
      
      // Update notification to mark as read
      notification.read = true;
      await notificationRepository.save(notification);
      
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  /**
   * Mark all notifications as read for the current user
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // First, find the employee record for this user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: user.id } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      
      // Get all unread notifications for this user
      const notificationRepository = getRepository(Notification);
      const notifications = await notificationRepository.find({
        where: {
          recipient: { id: employee.id },
          read: false
        }
      });
      
      // Update all to read
      for (const notification of notifications) {
        notification.read = true;
      }
      
      await notificationRepository.save(notifications);
      
      res.status(200).json({ 
        message: 'All notifications marked as read',
        count: notifications.length
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  /**
   * Delete a notification
   */
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = req.params.id;
      const user = (req as any).user;
      
      if (!user || !user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // First, find the employee record for this user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { authUserId: user.id } });
      
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      
      // Find the notification
      const notificationRepository = getRepository(Notification);
      const notification = await notificationRepository.findOne({
        where: { 
          id: notificationId,
          recipient: { id: employee.id }
        }
      });
      
      if (!notification) {
        res.status(404).json({ message: 'Notification not found or you do not have permission to delete it' });
        return;
      }
      
      // Delete the notification
      await notificationRepository.remove(notification);
      
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}