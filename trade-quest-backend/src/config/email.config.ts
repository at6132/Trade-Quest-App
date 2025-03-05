import { registerAs } from '@nestjs/config';
import CONSTANTS from 'src/common/constants';

export default registerAs('email', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '465', 10),
  secure: process.env.MAIL_SECURE,
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  fromEmail: process.env.MAIL_USER,
  fromName: process.env.MAIL_FROM_NAME,
  appUrl: process.env.APP_URL,
  verificationTokenExpiry: CONSTANTS.EMAIL_VERIFICATION_EXPIRES_IN,
  resetTokenExpiry: CONSTANTS.RESET_TOKEN_EXPIRY,
  otpExpiry: CONSTANTS.OTP_EXPIRY,
}));
