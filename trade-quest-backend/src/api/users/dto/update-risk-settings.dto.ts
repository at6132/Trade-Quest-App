import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateRiskSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  maxRiskPerTrade?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxDailyLoss?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  leveragePreference?: number;

  @IsOptional()
  @IsBoolean()
  requireStopLoss?: boolean;
}
