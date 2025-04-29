// filepath: src/services/notificationService.ts
import { getRepository } from 'typeorm';
import { Notification, Employee } from '../models';
import nodemailer from 'nodemailer';

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transport (this is a simplified example)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user',
        pass: process.env.EMAIL_PASSWORD || 'password'
      }
    });
  }

  async sendLeaveRequestNotification(leaveRequestId: string, employeeId: string, managerId: string): Promise<void> {
    try {
      // Create in-app notification
      const notificationRepository = getRepository(Notification);
      const employeeRepository = getRepository(Employee);
      
      const [employee, manager] = await Promise.all([
        employeeRepository.findOne({ where: { id: employeeId } }),
        employeeRepository.findOne({ where: { id: managerId } })
      ]);

      if (!employee || !manager) {
        throw new Error('Employee or manager not found');
      }

      // Create notification for manager
      await notificationRepository.save({
        recipientId: managerId,
        title: 'New Leave Request',
        message: `${employee.firstName} ${employee.lastName} has requested leave.`,
        relatedEntityId: leaveRequestId,
        entityType: 'LEAVE_REQUEST',
        type: 'LEAVE_SUBMITTED',
        read: false
      });

      // Send email to manager
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'leaves@company.com',
        to: manager.email,
        subject: 'New Leave Request',
        text: `${employee.firstName} ${employee.lastName} has submitted a leave request that requires your approval.`,
        html: `<p>${employee.firstName} ${employee.lastName} has submitted a leave request that requires your approval.</p>
               <p>Please log in to the Leave Management System to review this request.</p>`
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendLeaveApprovalNotification(leaveRequestId: string, employeeId: string, approved: boolean): Promise<void> {
    try {
      const notificationRepository = getRepository(Notification);
      const employeeRepository = getRepository(Employee);
      
      const employee = await employeeRepository.findOne({ where: { id: employeeId } });

      if (!employee) {
        throw new Error('Employee not found');
      }

      const status = approved ? 'approved' : 'rejected';

      // Create notification for employee
      await notificationRepository.save({
        recipientId: employeeId,
        title: `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
        message: `Your leave request has been ${status}.`,
        relatedEntityId: leaveRequestId,
        entityType: 'LEAVE_REQUEST',
        type: approved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        read: false
      });

      // Send email to employee
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'leaves@company.com',
        to: employee.email,
        subject: `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
        text: `Your leave request has been ${status}.`,
        html: `<p>Your leave request has been ${status}.</p>
               <p>Please log in to the Leave Management System for more details.</p>`
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async sendUpcomingLeaveReminder(): Promise<void> {
    // This could be run by a scheduled job to remind employees of upcoming leave
    // Implementation would be similar to the methods above
  }
}