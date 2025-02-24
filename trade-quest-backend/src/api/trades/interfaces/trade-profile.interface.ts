import { Types } from 'mongoose';
import { Trade } from '../schemas/trade.schema';

export interface TradeProfile extends Omit<Trade, 'userId' | 'portfolioId' | 'assetId'> {
  userId: string;
  portfolioId: string;
  assetId: string;
} 