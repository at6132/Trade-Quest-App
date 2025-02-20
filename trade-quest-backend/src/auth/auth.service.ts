import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
    const payload = { email: user.email, sub: user._id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
} 