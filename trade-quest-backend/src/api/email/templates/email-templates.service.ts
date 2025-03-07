import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CONSTANTS from 'src/common/constants';

@Injectable()
export class EmailTemplatesService {
  constructor(private configService: ConfigService) {}

  getVerificationEmailTemplate(name: string, token: string): string {
    const emailConfig = this.configService.get('email');
    const verificationUrl = `${emailConfig.appUrl}/api/auth/verify-email?token=${token}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>This link will expire in ${CONSTANTS.EMAIL_VERIFICATION_EXPIRES_IN}.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `;
  }

  getPasswordResetTemplate(name: string, token: string): string {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${token}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }

  getOtpEmailTemplate(name: string, otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 4px;">${otp}</h1>
        <p>This code will expire in ${CONSTANTS.OTP_EXPIRY}.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;
  }
}
