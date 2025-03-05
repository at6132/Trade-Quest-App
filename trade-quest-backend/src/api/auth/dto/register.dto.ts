import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  Matches,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { AuthProvider } from '../../../common/enums';
import CONSTANTS from '../../../common/constants';
import MESSAGES from 'src/common/messages';

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
  @Matches(CONSTANTS.PASSWORD_REGEX, {
    message: MESSAGES.PASSWORD_ERROR_MESSAGE,
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
