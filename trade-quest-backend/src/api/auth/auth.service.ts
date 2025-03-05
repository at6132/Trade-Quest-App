import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/api/users/schemas/user.schema';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
    const payload: JwtPayload = { email: user?.email, sub: user?._id };
    const { tfaMethod, tfaEnabled, password, ...responseUser } = user;

    return {
      user: responseUser,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
