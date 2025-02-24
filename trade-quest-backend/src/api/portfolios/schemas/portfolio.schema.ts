import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Asset } from '../../../assets/schemas/asset.schema';

export type PortfolioDocument = HydratedDocument<Portfolio>;

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Asset' }] })
  assets: Asset[];

  @Prop({ default: 10000 })
  balance: number;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1, min: 1, max: 5 })
  tier: number;

  @Prop({ default: 0 })
  profitableTradesCount: number;

  @Prop({ default: 0 })
  totalTradesCount: number;

  @Prop({ default: 0 })
  winRate: number;

  @Prop({ default: 3 })
  maxOpenTrades: number;

  @Prop({ default: 1 })
  maxLeverage: number;

  @Prop({ default: true })
  requireStopLoss: boolean;

  @Prop({ default: 'paper', enum: ['paper', 'live'] })
  tradingAccess: 'paper' | 'live';

  @Prop({
    default: [],
    type: [{ type: String, enum: ['stocks', 'crypto', 'forex', 'futures', 'options'] }],
  })
  allowedMarkets: ('stocks' | 'crypto' | 'forex' | 'futures' | 'options')[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
