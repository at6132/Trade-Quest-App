import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class CreateLoginHistoryDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsIP()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  browser: string;

  @IsNotEmpty()
  @IsString()
  os: string;

  @IsNotEmpty()
  @IsString()
  device: string;
} 