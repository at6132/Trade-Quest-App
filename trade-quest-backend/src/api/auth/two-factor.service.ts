import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { UsersService } from '../users/users.service';
import { INVALID_TOKEN, PHONE_NUMBER_REQUIRED, USER_NOT_FOUND, TWO_FACTOR_NOT_ENABLED, MAIL_FROM_NAME, MAIL_FROM_EMAIL } from 'src/config/constants';
import { Enable2faDto } from './dto/enable-2fa.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TwoFactorService {
  private twilioClient: Twilio;
  private emailTransporter: nodemailer.Transporter;
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  constructor(private configService: ConfigService, private usersService: UsersService, private jwtService: JwtService) {
    // Initialize Twilio client for SMS
    this.twilioClient = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  // Generate secret for authenticator app
  generateSecret(username: string): { secret: string; otpAuthUrl: string } {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('APP_NAME');
    const otpAuthUrl = authenticator.keyuri(username, appName, secret);
    
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

  // Send OTP via SMS
  async sendSmsOtp(phoneNumber: string): Promise<{ success: boolean; otp?: string; error?: string }> {
    const otp = this.generateOtp();
    
    try {
      await this.twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
      
      return { success: true, otp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send OTP via Email
  async sendEmailOtp(email: string, name: string): Promise<{ success: boolean; otp?: string; error?: string }> {
    const otp = this.generateOtp();
    
    try {
      await this.emailTransporter.sendMail({
        from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`,
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${name},</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 4px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
      
      return { success: true, otp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUser2faStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    
    return {
      tfaEnabled: user.tfaEnabled,
      tfaMethod: user.tfaMethod
    };
  }

  async enable2fa(userId: string, enable2faDto: Enable2faDto): Promise<{ success: boolean; secret?: string; qrCode?: string }> {
    const { method, phoneNumber } = enable2faDto;
    
    // If method is SMS, validate phone number
    if (method === 'sms' && !phoneNumber) {
      throw new BadRequestException(PHONE_NUMBER_REQUIRED);
    }
    
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    
    // Generate secret for authenticator method
    let tfaSecret = '';
    let qrCode = '';
    
    if (method === 'authenticator') {
      const { secret, otpAuthUrl } = this.generateSecret(user.username);
      tfaSecret = secret;
      qrCode = await this.generateQrCode(otpAuthUrl);
    }
    
    // Update user with 2FA settings
    await this.usersService.update(userId, {
      tfaMethod: method,
      tfaSecret,
      phoneNumber: method === 'sms' ? phoneNumber : undefined,
    });
    
    return { 
      success: true,
      secret: tfaSecret,
      qrCode
    };
  }

  async verify2fa(userId: string, token: string): Promise<{ success: boolean }> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    
    if (!user.tfaMethod) {
      throw new BadRequestException(TWO_FACTOR_NOT_ENABLED);
    }
    
    let isValid = false;
    
    if (user.tfaMethod === 'authenticator') {
      isValid = this.verifyToken(token, user.tfaSecret);
    } else {
      // For SMS and Email, the token should be validated against a stored OTP
      isValid = token === user.temporaryOtp; // This is simplified
    }
    
    if (!isValid) {
      throw new UnauthorizedException(INVALID_TOKEN);
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

  async verify2faLogin(token: string, tempToken: string): Promise<{ user: any; access_token: string }> {
    try {
      // Decode the temporary token to get the user ID
      const decoded = this.jwtService.verify(tempToken);
      
      if (!decoded.requires2FA) {
        throw new UnauthorizedException(INVALID_TOKEN);
      }
      
      const userId = decoded.sub;
      const user = await this.usersService.findById(userId);
      
      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND);
      }
      
      // Verify the 2FA token
      const isValid = await this.verify2fa(userId, token);
      
      if (!isValid.success) {
        throw new UnauthorizedException(INVALID_TOKEN);
      }
      
      // Generate a full access token
      const payload = { email: user.email, sub: user._id };
      
      return {
        user,
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
  }

  
} 