import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BrokerType, AssetClass } from '../../../common/enums';

export class ConnectBrokerDto {
  @IsNotEmpty()
  @IsEnum(BrokerType)
  brokerType: BrokerType;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  credentials: Record<string, any>;

  @IsOptional()
  @IsEnum(AssetClass)
  assetClass?: AssetClass;
}
