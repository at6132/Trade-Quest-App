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
import { Enable2faDto } from './dto/enable-2fa.dto';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorMethod } from 'src/common/enums';

@Injectable()
export class TwoFactorService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async enable2fa(
    userId: string,
    enable2faDto: Enable2faDto,
  ): Promise<{ success: boolean; secret?: string; qrCode?: string }> {
    const { method, phoneNumber } = enable2faDto;

    // If method is SMS, validate phone number
    if (method === TwoFactorMethod.SMS && !phoneNumber) {
      throw new BadRequestException(MESSAGES.PHONE_NUMBER_REQUIRED);
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    // Generate secret for authenticator method
    let tfaSecret = '';
    let qrCode = '';

    if (method === TwoFactorMethod.AUTHENTICATOR) {
      const { secret, otpAuthUrl } = this.generateSecret(user.username);
      tfaSecret = secret;
      qrCode = await this.generateQrCode(otpAuthUrl);
    }

    // Update user with 2FA settings
    await this.usersService.update(userId, {
      tfaMethod: method,
      tfaSecret,
      phoneNumber: method === TwoFactorMethod.SMS ? phoneNumber : undefined,
    });

    return {
      success: true,
      secret: tfaSecret,
      qrCode,
    };
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
      isValid = token === user.temporaryOtp; // This is simplified
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

  async disable2fa(userId: string): Promise<{ success: boolean }> {
    await this.usersService.update(userId, {
      tfaEnabled: false,
      tfaMethod: undefined,
      tfaSecret: undefined,
    });

    return { success: true };
  }

  async verify2faLogin(
    token: string,
    tempToken: string,
  ): Promise<{ user: any; access_token: string }> {
    try {
      // Decode the temporary token to get the user ID
      const decoded = this.jwtService.verify(tempToken);

      if (!decoded.requires2FA) {
        throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
      }

      const userId = decoded.sub;
      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
      }

      // Verify the 2FA token
      const isValid = await this.verify2fa(userId, token);

      if (!isValid.success) {
        throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
      }

      // Generate a full access token
      const payload = { email: user.email, sub: user._id };

      return {
        user,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
  }
}
