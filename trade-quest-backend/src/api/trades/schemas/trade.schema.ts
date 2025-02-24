import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TradeDocument = HydratedDocument<Trade>;

@Schema({ timestamps: true })
export class Trade {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Portfolio', required: true })
  portfolioId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  assetId: Types.ObjectId;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true, enum: ['buy', 'sell'] })
  type: 'buy' | 'sell';

  @Prop({ required: true, enum: ['stocks', 'crypto', 'forex', 'futures', 'options'] })
  market: 'stocks' | 'crypto' | 'forex' | 'futures' | 'options';

  @Prop({ required: true })
  exchange: string;

  @Prop({ required: true })
  entryPrice: number;

  @Prop()
  exitPrice?: number;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  stopLoss?: number;

  @Prop()
  takeProfit?: number;

  @Prop({ default: 1 })
  leverage: number;

  @Prop()
  exitDate?: Date;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: 'open' | 'closed';

  @Prop({ default: 0 })
  pnl: number;

  @Prop({ default: 0 })
  pnlPercentage: number;

  @Prop({ default: false })
  isRiskControlled: boolean;

  @Prop()
  notes?: string;

  @Prop({ default: 0 })
  xpEarned: number;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
