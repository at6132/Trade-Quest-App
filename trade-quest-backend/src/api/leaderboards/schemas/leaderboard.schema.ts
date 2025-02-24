import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaderboardDocument = HydratedDocument<Leaderboard>;

@Schema({ timestamps: true })
export class Leaderboard {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['weekly', 'competition', 'pod'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Pod' })
  podId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Competition' })
  competitionId?: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ min: 1, max: 5, required: true })
  requiredTier: number;

  @Prop({ default: 5000 })
  startingBalance: number;

  @Prop({ default: 180 })
  durationMinutes: number;

  @Prop([
    {
      userId: { type: Types.ObjectId, ref: 'User', required: true },
      rank: Number,
      score: Number,
      profitability: Number,
      trades: Number,
      winRate: Number,
      balance: Number,
    },
  ])
  rankings: Array<{
    userId: Types.ObjectId;
    rank: number;
    score: number;
    profitability: number;
    trades: number;
    winRate: number;
    balance: number;
  }>;

  @Prop({
    type: {
      xp: { type: Number, default: 0 },
      rewards: { type: [String], default: [] },
    },
  })
  prize: {
    xp: number;
    rewards: string[];
  };
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
