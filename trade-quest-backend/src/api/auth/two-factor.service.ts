import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UsersService } from '../users/users.service';
import MESSAGES from '../../common/messages';
import { TwoFactorMethod } from 'src/common/enums';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { User } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { TwoFactorSetupResponse } from './interfaces/two-factor.interface';

@Injectable()
export class TwoFactorService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private emailService: EmailService,
    private smsService: SmsService,
    private authService: AuthService,
  ) {}

  // Generate secret for authenticator app
  generateSecret(email: string): { secret: string; otpAuthUrl: string } {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('APP_NAME');
    const otpAuthUrl = authenticator.keyuri(email, appName, secret);
    return {
      secret,
      otpAuthUrl,
    };
  }

  // Generate QR code for authenticator app
  async generateQrCode(otpAuthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpAuthUrl);
  }

  // Verify token from authenticator app
  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  async setup2fa(
    user: User,
    method: TwoFactorMethod,
    phoneNumber?: string,
  ): Promise<TwoFactorSetupResponse> {
    const result: TwoFactorSetupResponse = { tfaMethod: method };
    if (method === TwoFactorMethod.AUTHENTICATOR) {
      // generate secret and qr code
      const { secret, otpAuthUrl } = this.generateSecret(user.email);
      const qrCode = await this.generateQrCode(otpAuthUrl);

      // save secret temporarily
      await this.usersService.update(user._id.toString(), {
        tfaSecret: secret,
        tfaMethod: method,
        tfaEnabled: false,
      });

      result.qrCode = qrCode;
    }

    if (method === TwoFactorMethod.EMAIL || method === TwoFactorMethod.SMS) {
      const otp = this.authService.generateOtp();
      if (method === TwoFactorMethod.EMAIL) {
        await this.emailService.sendOtpEmail(user.name, user.email, otp);
      } else {
        if (!user.phoneNumber && !phoneNumber) {
          throw new BadRequestException(MESSAGES.PHONE_NUMBER_REQUIRED);
        }
        await this.smsService.sendOtp(phoneNumber || user.phoneNumber, otp);
      }

      await this.usersService.update(user._id.toString(), {
        tempOtp: otp,
        tfaMethod: method,
        tfaEnabled: false,
      });
    }

    return result;
  }

  async verify2fa(
    userId: string,
    token: string,
  ): Promise<{ success: boolean }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.tfaMethod) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR_NOT_ENABLED);
    }

    let isValid = false;

    if (user.tfaMethod === TwoFactorMethod.AUTHENTICATOR) {
      isValid = this.verifyToken(token, user.tfaSecret);
    } else {
      // For SMS and Email, the token should be validated against a stored OTP
      isValid = token === user.tempOtp;
    }

    if (!isValid) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }

    // If this is the first verification, enable 2FA
    if (!user.tfaEnabled) {
      await this.usersService.update(userId, { tfaEnabled: true });
    }

    return { success: true };
  }

  async disable2fa(userId: string): Promise<boolean> {
    await this.usersService.update(userId, {
      tfaEnabled: false,
      tfaMethod: '',
      tfaSecret: '',
      tempOtp: '',
    });

    return true;
  }

  async verifyOtp(user: User, otp: string): Promise<boolean> {
    let isValid = false;

    if (user.tfaMethod === TwoFactorMethod.AUTHENTICATOR) {
      isValid = this.verifyToken(otp, user.tfaSecret);
    } else {
      isValid = otp === user.tempOtp;
    }

    return isValid;
  }

  async confirm2fa(user: User, token: string): Promise<boolean> {
    const isValid = await this.verifyOtp(user, token);

    isValid
      ? await this.usersService.update(user._id.toString(), {
          tfaEnabled: true,
          tempOtp: '', // Clear temporary OTP
        })
      : false;

    return isValid;
  }
}
