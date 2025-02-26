import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/api/users/schemas/user.schema';
import { INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED } from 'src/config/constants';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(EMAIL_NOT_VERIFIED);
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    const userResponse = {
      name: user.name,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      provider: user.provider,
      xp: user.xp,
      tier: user.tier,
      assets: user.assets,
      _id: user._id,
    };

    return userResponse;
  }

  async login(user: User) {
    // Check if 2FA is enabled
    if (user.tfaEnabled) {
      // Return a temporary token that can only be used for 2FA verification
      const payload = {
        sub: user._id,
        email: user.email,
        requires2FA: true,
      };

      return {
        requires2FA: true,
        tfaMethod: user.tfaMethod,
        temp_token: this.jwtService.sign(payload, { expiresIn: '5m' }),
      };
    }

    // If 2FA is not enabled, return a full access token
    const payload = { email: user.email, sub: user._id };

    return {
      user,
      access_token: this.jwtService.sign(payload),
      requires2FA: false,
    };
  }
}
