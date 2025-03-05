import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TwoFactorMethod } from 'src/common/enums';
export class Enable2faDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
