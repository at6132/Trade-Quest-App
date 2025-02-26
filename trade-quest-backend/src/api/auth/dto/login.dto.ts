import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EMAIL_REQUIRED, PASSWORD_REQUIRED } from 'src/config/constants';
export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: EMAIL_REQUIRED })
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: PASSWORD_REQUIRED })
  password: string;
} 