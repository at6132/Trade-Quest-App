import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import MESSAGES from '../../../common/messages';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: MESSAGES.EMAIL_REQUIRED })
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: MESSAGES.PASSWORD_REQUIRED })
  password: string;
}
