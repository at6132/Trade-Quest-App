import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Portfolio, PortfolioDocument } from './schemas/portfolio.schema';
import { PortfolioProfile } from './interfaces/portfolio-profile.interface';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectModel(Portfolio.name)
    private portfolioModel: Model<PortfolioDocument>,
  ) {}

  async create(
    userId: string,
    portfolio: Partial<Portfolio>,
  ): Promise<PortfolioProfile> {
    const newPortfolio = new this.portfolioModel({
      ...portfolio,
      user: userId,
    });
    const savedPortfolio = await newPortfolio.save();
    return this.buildPortfolioProfile(savedPortfolio);
  }

  async findAll(userId: string): Promise<PortfolioProfile[]> {
    const portfolios = await this.portfolioModel.find({ user: userId }).exec();
    return portfolios.map((portfolio) => this.buildPortfolioProfile(portfolio));
  }

  async findOne(
    userId: string,
    portfolioId: string,
  ): Promise<PortfolioProfile> {
    const portfolio = await this.portfolioModel
      .findOne({ _id: portfolioId, user: userId })
      .exec();
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return this.buildPortfolioProfile(portfolio);
  }

  async update(
    userId: string,
    portfolioId: string,
    updates: Partial<Portfolio>,
  ): Promise<PortfolioProfile> {
    const portfolio = await this.portfolioModel
      .findOneAndUpdate({ _id: portfolioId, user: userId }, updates, {
        new: true,
      })
      .exec();

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return this.buildPortfolioProfile(portfolio);
  }

  async remove(userId: string, portfolioId: string): Promise<void> {
    const result = await this.portfolioModel
      .deleteOne({ _id: portfolioId, user: userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Portfolio not found');
    }
  }

  private buildPortfolioProfile(
    portfolio: PortfolioDocument,
  ): PortfolioProfile {
    return {
      name: portfolio.name,
      description: portfolio.description,
      balance: portfolio.balance,
      isDefault: portfolio.isDefault,
      xp: portfolio.xp,
      tier: portfolio.tier,
      profitableTradesCount: portfolio.profitableTradesCount,
      totalTradesCount: portfolio.totalTradesCount,
      winRate: portfolio.winRate,
      userId: portfolio.userId.toString(),
      assets: portfolio.assets,
      maxOpenTrades: portfolio.maxOpenTrades,
      maxLeverage: portfolio.maxLeverage,
      requireStopLoss: portfolio.requireStopLoss,
      tradingAccess: portfolio.tradingAccess,
      allowedMarkets: portfolio.allowedMarkets,
    };
  }
}
