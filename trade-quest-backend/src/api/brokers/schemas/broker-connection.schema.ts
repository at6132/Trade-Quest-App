import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BrokerType, AssetClass } from '../../../common/enums';

export type BrokerConnectionDocument = BrokerConnection & Document;

@Schema({ timestamps: true })
export class BrokerConnection {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true, enum: BrokerType })
  brokerType: BrokerType;

  @Prop({ required: true, enum: AssetClass })
  assetClass: AssetClass;

  @Prop({ required: true, type: Object })
  credentials: Record<string, any>;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: Date })
  lastConnected?: Date;

  @Prop({ type: Object })
  accountInfo?: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  isDemo: boolean;
}

export const BrokerConnectionSchema =
  SchemaFactory.createForClass(BrokerConnection);
