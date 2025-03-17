import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderSide, OrderType } from '../../../common/enums';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @IsNotEmpty()
  @IsEnum(OrderSide)
  side: OrderSide;

  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopPrice?: number;
}
