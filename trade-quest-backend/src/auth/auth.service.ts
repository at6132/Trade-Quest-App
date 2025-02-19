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

  async validateUser(loginDto: LoginDto): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user && await bcrypt.compare(loginDto.password, user.password) && user.isVerified) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
} 