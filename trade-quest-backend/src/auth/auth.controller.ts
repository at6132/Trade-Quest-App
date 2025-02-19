import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.findByEmail(registerDto.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user as User);
  }
} 