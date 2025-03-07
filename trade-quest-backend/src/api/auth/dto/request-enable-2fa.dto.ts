import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TwoFactorMethod } from 'src/common/enums';

// request enable 2fa dto
export class RequestEnable2faDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
