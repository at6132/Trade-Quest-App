import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/api/users/schemas/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import CONSTANTS from 'src/common/constants';
import { TwoFactorMethod } from 'src/common/enums';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isVerified) {
      return null;
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password, tfaSecret, temporaryOtp, ...responseUser } = user;

    return responseUser;
  }

  async login(user: User) {
    let payload: JwtPayload = { email: user?.email, sub: user?._id };
    if (user.tfaEnabled) {
      if (
        user.tfaMethod === TwoFactorMethod.EMAIL ||
        user.tfaMethod === TwoFactorMethod.SMS
      ) {
        const otp = this.generateOtp();
        user.tfaMethod === TwoFactorMethod.EMAIL
          ? await this.emailService.sendOtpEmail(user.name, user.email, otp)
          : await this.smsService.sendOtp(user.phoneNumber, otp);

        return {
          tfaEnabled: user.tfaEnabled,
          tfaMethod: user.tfaMethod,
          tempToken: this.jwtService.sign(payload, {
            expiresIn: CONSTANTS.OTP_EXPIRY,
          }),
        };
      }
    }

    const { password, ...responseUser } = user;

    return {
      user: responseUser,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
