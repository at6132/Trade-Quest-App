import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/api/users/schemas/user.schema';
import MESSAGES from '../../common/messages';
import { EmailService } from '../email/email.service';
import { EmailTemplatesService } from '../email/templates/email-templates.service';
import CONSTANTS from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private emailTemplatesService: EmailTemplatesService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(MESSAGES.EMAIL_NOT_VERIFIED);
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password, tfaSecret, temporaryOtp, ...responseUser } = user;

    return responseUser;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException(MESSAGES.USER_NOT_FOUND);
      }

      await this.usersService.update(user._id, { isVerified: true });

      return { message: MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY };
    } catch (error) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
  }

  async login(user: User) {
    // // Check if 2FA is enabled
    // if (user.tfaEnabled) {
    //   // Return a temporary token that can only be used for 2FA verification
    //   const payload = {
    //     sub: user._id,
    //     email: user.email,
    //   };

    //   return {
    //     tfaMethod: user.tfaMethod,
    //     temp_token: this.jwtService.sign(payload, { expiresIn: '5m' }),
    //   };
    // }

    // If 2FA is not enabled, return a full access token
    const payload = { email: user.email, sub: user._id };

    const { tfaMethod, tfaEnabled, ...responseUser } = user;

    return {
      user: responseUser,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
