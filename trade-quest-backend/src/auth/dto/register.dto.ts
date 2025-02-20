import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, Matches, IsBoolean, IsEnum } from 'class-validator';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from 'src/config/constants';
import { AuthProvider } from 'src/config/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(AuthProvider)
  @IsOptional()
  provider: AuthProvider = AuthProvider.EMAIL;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_ERROR_MESSAGE,
  })
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  avatar?: string;
} 