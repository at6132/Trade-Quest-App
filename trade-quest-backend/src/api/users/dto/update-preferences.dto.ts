import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsIn,
  IsEnum,
  ArrayMaxSize,
} from 'class-validator';
import {
  MarketType,
  TradingStyle,
  TimeFrame,
  Theme,
  ChartType,
  OrderType,
} from 'src/common/enums';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(Theme))
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  // Trading-specific preferences
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ChartType))
  chartType?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(TimeFrame))
  defaultTimeframe?: string;

  @IsOptional()
  @IsBoolean()
  priceAlerts?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  riskTolerance?: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(OrderType))
  defaultOrderType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  defaultLeverage?: number;

  @IsOptional()
  @IsBoolean()
  autoStopLoss?: boolean;

  @IsOptional()
  @IsBoolean()
  showVolume?: boolean;

  @IsOptional()
  @IsBoolean()
  showTechnicalIndicators?: boolean;

  @IsOptional()
  @IsArray()
  defaultWatchlist?: string[];

  @IsOptional()
  @IsObject()
  tradingPreferences?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsEnum(MarketType, { each: true })
  @ArrayMaxSize(5)
  preferredMarkets?: MarketType[];

  @IsOptional()
  @IsEnum(TradingStyle)
  tradingStyle?: TradingStyle;

  @IsOptional()
  @IsArray()
  @IsEnum(TimeFrame, { each: true })
  @ArrayMaxSize(5)
  preferredTimeframes?: TimeFrame[];
}
