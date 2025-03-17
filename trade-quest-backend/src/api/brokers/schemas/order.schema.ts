import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  OrderSide,
  OrderType,
  OrderStatus,
  AssetClass,
} from '../../../common/enums';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'BrokerConnection',
  })
  brokerConnectionId: string;

  @Prop({ required: true })
  brokerOrderId: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, enum: OrderSide })
  side: OrderSide;

  @Prop({ required: true, enum: OrderType })
  type: OrderType;

  @Prop({ required: true, enum: AssetClass })
  assetClass: AssetClass;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ type: Number })
  price?: number;

  @Prop({ type: Number })
  stopPrice?: number;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: Object })
  details?: any;

  @Prop({ type: Date })
  filledAt?: Date;

  @Prop({ type: Number })
  filledPrice?: number;

  @Prop({ type: Number })
  filledQuantity?: number;

  @Prop({ type: Number })
  commission?: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
