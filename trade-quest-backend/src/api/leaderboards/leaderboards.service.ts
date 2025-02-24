import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leaderboard, LeaderboardDocument } from './schemas/leaderboard.schema';
import { LeaderboardProfile } from './interfaces/leaderboard-profile.interface';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectModel(Leaderboard.name)
    private readonly leaderboardModel: Model<LeaderboardDocument>,
  ) {}

  async create(leaderboard: Partial<Leaderboard>): Promise<LeaderboardProfile> {
    const createdLeaderboard = await new this.leaderboardModel(leaderboard).save();
    return this.buildLeaderboardProfile(createdLeaderboard);
  }

  async findAll(): Promise<LeaderboardProfile[]> {
    const leaderboards = await this.leaderboardModel.find().exec();
    return leaderboards.map(leaderboard => this.buildLeaderboardProfile(leaderboard));
  }

  async findOne(id: string): Promise<LeaderboardProfile> {
    const leaderboard = await this.leaderboardModel.findById(id).exec();
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }
    return this.buildLeaderboardProfile(leaderboard);
  }

  async update(id: string, leaderboard: Partial<Leaderboard>): Promise<LeaderboardProfile> {
    const updatedLeaderboard = await this.leaderboardModel
      .findByIdAndUpdate(id, leaderboard, { new: true })
      .exec();
    if (!updatedLeaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }
    return this.buildLeaderboardProfile(updatedLeaderboard);
  }

  async remove(id: string): Promise<void> {
    const result = await this.leaderboardModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }
  }

  private buildLeaderboardProfile(leaderboard: LeaderboardDocument): LeaderboardProfile {
    const doc = leaderboard.toJSON();
    return {
      ...doc,
      podId: doc.podId?.toString(),
      competitionId: doc.competitionId?.toString(),
    };
  }
}
