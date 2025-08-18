// src/services/emailService.ts

import nodemailer from 'nodemailer';
import { User } from '../models/User';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(this.config);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: User, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const template: EmailTemplate = {
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Company!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Welcome to Our Company!
        
        Hi ${user.firstName},
        
        Thank you for registering with us. Please verify your email address by visiting this link:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const template: EmailTemplate = {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hi ${user.firstName},
        
        We received a request to reset your password. Visit this link to create a new password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user: User): Promise<void> {
    const template: EmailTemplate = {
      subject: 'Welcome to Our Company!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Company!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your account has been successfully created and verified. You can now log in to your account.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Welcome to Our Company!
        
        Hi ${user.firstName},
        
        Your account has been successfully created and verified. You can now log in to your account.
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send account status update email
   */
  async sendAccountStatusUpdate(user: User, status: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `Account Status Updated - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Account Status Update</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your account status has been updated to: <strong>${status}</strong></p>
          <p>If you have any questions about this change, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `,
      text: `
        Account Status Update
        
        Hi ${user.firstName},
        
        Your account status has been updated to: ${status}
        
        If you have any questions about this change, please contact our support team.
        
        Best regards,
        Your Company Team
      `,
    };

    await this.sendEmail(user.email, template);
  }

  /**
   * Send generic email
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Your Company'}" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Verify email service configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.auth.user && this.config.auth.pass);
  }

  /**
   * Get configuration (for debugging)
   */
  getConfig(): Partial<EmailConfig> {
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user ? '***configured***' : '***missing***',
        pass: this.config.auth.pass ? '***configured***' : '***missing***',
      },
    };
  }
}

export default EmailService;
