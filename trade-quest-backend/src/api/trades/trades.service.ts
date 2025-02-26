import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trade, TradeDocument } from './schemas/trade.schema';
import { TradeProfile } from './interfaces/trade-profile.interface';

@Injectable()
export class TradesService {
  constructor(
    @InjectModel(Trade.name) private readonly tradeModel: Model<TradeDocument>,
  ) {}

  async create(trade: Partial<Trade>): Promise<TradeProfile> {
    const createdTrade = await new this.tradeModel(trade).save();
    return this.buildTradeProfile(createdTrade);
  }

  async findAll(): Promise<TradeProfile[]> {
    const trades = await this.tradeModel.find().exec();
    return trades.map((trade) => this.buildTradeProfile(trade));
  }

  async findOne(id: string): Promise<TradeProfile> {
    const trade = await this.tradeModel.findById(id).exec();
    if (!trade) {
      throw new NotFoundException(`Trade with ID ${id} not found`);
    }
    return this.buildTradeProfile(trade);
  }

  async update(id: string, trade: Partial<Trade>): Promise<TradeProfile> {
    const updatedTrade = await this.tradeModel
      .findByIdAndUpdate(id, trade, { new: true })
      .exec();
    if (!updatedTrade) {
      throw new NotFoundException(`Trade with ID ${id} not found`);
    }
    return this.buildTradeProfile(updatedTrade);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tradeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Trade with ID ${id} not found`);
    }
  }

  private buildTradeProfile(trade: TradeDocument): TradeProfile {
    const doc = trade.toJSON();
    return {
      ...doc,
      userId: doc.userId.toString(),
      portfolioId: doc.portfolioId.toString(),
      assetId: doc.assetId.toString(),
    };
  }
}
