import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  fromEmail: process.env.MAIL_FROM_EMAIL,
  fromName: process.env.MAIL_FROM_NAME,
  appUrl: process.env.APP_URL,
  verificationTokenExpiry: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRY || '86400',
    10,
  ),
  resetTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY || '3600', 10),
  otpExpiry: parseInt(process.env.OTP_EXPIRY || '600', 10),
}));
