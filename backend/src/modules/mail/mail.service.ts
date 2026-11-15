import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
      },
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"ClubHub" <${process.env.MAIL_FROM || process.env.MAIL_USER || 'noreply@clubhub.com'}>`,
      to,
      subject: 'ClubHub — Password Reset Request',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 32px;">
          <div style="background: linear-gradient(135deg, #0369a1, #4f46e5); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 24px; font-weight: 900; margin: 0;">ClubHub</h1>
            <p style="color: #bae6fd; margin: 8px 0 0;">Membership Management System</p>
          </div>

          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 8px;">Hello, ${name}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset the password for your club account.
              Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>

            <a href="${resetUrl}" style="display: inline-block; background: #0284c7; color: white; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin-bottom: 24px;">
              Reset My Password
            </a>

            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">Or copy this link into your browser:</p>
            <p style="color: #0284c7; font-size: 12px; word-break: break-all; background: #f0f9ff; padding: 10px; border-radius: 8px; margin: 0 0 24px;">${resetUrl}</p>

            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you did not request a password reset, you can safely ignore this email.
              Your password will not change.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} ClubHub Membership System. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
      // Don't throw — email failure should not block the reset token generation
    }
  }

  async sendWelcomeEmail(to: string, name: string, memberCode: string) {
    const mailOptions = {
      from: `"ClubHub" <${process.env.MAIL_FROM || process.env.MAIL_USER || 'noreply@clubhub.com'}>`,
      to,
      subject: 'Welcome to ClubHub — Your Membership is Confirmed!',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 32px;">
          <div style="background: linear-gradient(135deg, #0369a1, #4f46e5); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 24px; font-weight: 900; margin: 0;">Welcome to ClubHub! 🎉</h1>
            <p style="color: #bae6fd; margin: 8px 0 0;">Your membership is officially active</p>
          </div>

          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 8px;">Hello, ${name}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px;">
              Your club membership has been successfully registered. Here are your account details:
            </p>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Your Unique Member ID</p>
              <p style="margin: 0; color: #0369a1; font-size: 24px; font-weight: 900; font-family: monospace;">${memberCode}</p>
            </div>

            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="display: inline-block; background: #0284c7; color: white; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
              Sign In to Your Portal
            </a>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`);
    }
  }

  async sendMembershipRenewalEmail(to: string, name: string, planName: string, expiryDate: Date) {
    const mailOptions = {
      from: `"ClubHub" <${process.env.MAIL_FROM || process.env.MAIL_USER || 'noreply@clubhub.com'}>`,
      to,
      subject: 'ClubHub — Membership Renewed Successfully',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 32px;">
          <div style="background: linear-gradient(135deg, #059669, #0369a1); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 24px; font-weight: 900; margin: 0;">Membership Renewed ✅</h1>
          </div>
          <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 8px;">Hi ${name},</h2>
            <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px;">
              Your <strong>${planName}</strong> membership has been renewed successfully.
              Your new access period is valid until <strong>${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/member/membership"
               style="display: inline-block; background: #059669; color: white; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
              View My Membership
            </a>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Renewal confirmation email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send renewal email to ${to}: ${error.message}`);
    }
  }
}
