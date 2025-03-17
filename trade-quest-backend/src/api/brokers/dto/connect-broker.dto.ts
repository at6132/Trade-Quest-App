import { IsEnum, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BrokerType } from '../../../common/enums';

export class ConnectBrokerDto {
  @IsNotEmpty()
  @IsEnum(BrokerType)
  brokerType: BrokerType;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  credentials: Record<string, any>;
}
