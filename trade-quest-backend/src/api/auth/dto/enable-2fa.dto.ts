import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TwoFactorMethod } from 'src/config/enums';
export class Enable2faDto {
  @IsEnum(TwoFactorMethod)
  method: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
