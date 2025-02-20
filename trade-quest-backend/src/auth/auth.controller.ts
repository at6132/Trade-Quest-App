import { 
  Controller, 
  Post, 
  Body, 
  UnauthorizedException, 
  BadRequestException,
  Get,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserProfile } from 'src/users/interfaces/user-profile.interface';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private usersService: UsersService
  ) {}

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }
    return this.authService.login(req.user as User);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request): Promise<UserProfile> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user['id'];
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      throw new UnauthorizedException('User not found');
    }
    
    return profile;
  }
} 