import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import MESSAGES from 'src/common/messages';
import CONSTANTS from 'src/common/constants';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: MESSAGES.PASSWORD_REQUIRED })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: MESSAGES.PASSWORD_REQUIRED })
  @MinLength(8, { message: MESSAGES.PASSWORD_MIN_LENGTH })
  @MaxLength(32, { message: MESSAGES.PASSWORD_MAX_LENGTH })
  @Matches(CONSTANTS.PASSWORD_REGEX, {
    message: MESSAGES.PASSWORD_ERROR_MESSAGE,
  })
  newPassword: string;
}
