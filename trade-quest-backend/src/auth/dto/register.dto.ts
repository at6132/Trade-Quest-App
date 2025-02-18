import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from 'src/config/constants';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;


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

  @IsString()
  @IsOptional()
  avatar?: string;
} 