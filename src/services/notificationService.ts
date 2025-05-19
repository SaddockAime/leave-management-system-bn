// filepath: src/services/notificationService.ts
import { getRepository } from 'typeorm';
import { Notification, Employee, LeaveRequest } from '../models';
import nodemailer from 'nodemailer';
import { getSocketService } from '../config/socketio';
import dotenv from 'dotenv';
dotenv.config();

// Define valid notification types based on your model
type NotificationType = 'LEAVE_SUBMITTED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'LEAVE_REMINDER' | 'APPROVAL_PENDING' | 'LEAVE_CANCELLED';

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transport
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Notify about a new leave request (to admins and managers)
  async sendLeaveRequestCreatedNotification(leaveRequestId: string): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'leaveType']
      });
      
      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }
      
      const employee = leaveRequest.employee;
      
      // Get managers (assuming position field indicates manager role)
      const employeeRepository = getRepository(Employee);
      const managersAndAdmins = await employeeRepository.find({
        where: [
          { position: 'MANAGER' },
          { position: 'ADMIN' }
        ]
      });
      
      // Create notifications in database for each manager and admin
      const notificationRepository = getRepository(Notification);
      
      for (const recipient of managersAndAdmins) {
        if (recipient.id !== employee.id) { // Don't notify the requester
          // Create notification entity first
          const notification = new Notification();
          notification.recipient = recipient; // Set the whole recipient entity
          notification.title = 'New Leave Request';
          notification.message = `${employee.firstName} ${employee.lastName} has requested leave.`;
          notification.relatedEntityId = leaveRequestId;
          notification.entityType = 'LEAVE_REQUEST';
          notification.type = 'LEAVE_SUBMITTED';
          notification.read = false;
          
          await notificationRepository.save(notification);
          
          // Send email notification
          if (recipient.email) {
            try {
              await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
                to: recipient.email,
                subject: 'New Leave Request',
                text: `${employee.firstName} ${employee.lastName} has submitted a leave request that requires review.`,
                html: `<p>${employee.firstName} ${employee.lastName} has submitted a leave request that requires review.</p>
                      <p>Please log in to the Leave Management System to review this request.</p>`
              });
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }
        }
      }
      
      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(leaveRequestId, 'created');
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave request notification:', error);
    }
  }

  // Notify employee about leave request status update
  async sendLeaveStatusUpdateNotification(leaveRequestId: string, approved: boolean): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'leaveType']
      });
      
      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }
      
      const employee = leaveRequest.employee;
      const status = approved ? 'approved' : 'rejected';
      
      // Create notification in database
      const notificationRepository = getRepository(Notification);
      const notificationType: NotificationType = approved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
      
      const notification = new Notification();
      notification.recipient = employee; // Set the whole recipient entity
      notification.title = `Leave Request ${approved ? 'Approved' : 'Rejected'}`;
      notification.message = `Your leave request has been ${status}.`;
      notification.relatedEntityId = leaveRequestId;
      notification.entityType = 'LEAVE_REQUEST';
      notification.type = notificationType;
      notification.read = false;
      
      await notificationRepository.save(notification);
      
      // Send email to employee
      if (employee.email) {
        try {
          await this.transporter.sendMail({
            from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
            to: employee.email,
            subject: `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
            text: `Your leave request has been ${status}.`,
            html: `<p>Your leave request has been ${status}.</p>
                  <p>Please log in to the Leave Management System for more details.</p>`
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
      
      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(leaveRequestId, approved ? 'approved' : 'rejected');
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave status update notification:', error);
    }
  }

  // Notify managers and admins about leave request cancellation
  async sendLeaveCancellationNotification(leaveRequestId: string): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'leaveType']
      });
      
      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }
      
      const employee = leaveRequest.employee;
      
      // Get managers and admins
      const employeeRepository = getRepository(Employee);
      const managersAndAdmins = await employeeRepository.find({
        where: [
          { position: 'MANAGER' },
          { position: 'ADMIN' }
        ]
      });
      
      // Create notifications in database for each manager and admin
      const notificationRepository = getRepository(Notification);
      
      for (const recipient of managersAndAdmins) {
        if (recipient.id !== employee.id) { // Don't notify the requester
          // Create a new notification with a valid type
          const notification = new Notification();
          notification.recipient = recipient; // Set the whole recipient entity
          notification.title = 'Leave Request Cancelled';
          notification.message = `${employee.firstName} ${employee.lastName} has cancelled their leave request.`;
          notification.relatedEntityId = leaveRequestId;
          notification.entityType = 'LEAVE_REQUEST';
          notification.type = 'LEAVE_CANCELLED';
          notification.read = false;
          
          await notificationRepository.save(notification);
          
          // Send email notification
          if (recipient.email) {
            try {
              await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
                to: recipient.email,
                subject: 'Leave Request Cancelled',
                text: `${employee.firstName} ${employee.lastName} has cancelled their leave request.`,
                html: `<p>${employee.firstName} ${employee.lastName} has cancelled their leave request.</p>
                      <p>Please log in to the Leave Management System for more details.</p>`
              });
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }
        }
      }
      
      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(leaveRequestId, 'canceled');
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave cancellation notification:', error);
    }
  }
}