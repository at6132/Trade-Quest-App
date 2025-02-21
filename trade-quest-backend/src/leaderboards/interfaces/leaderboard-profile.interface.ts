import { Types } from 'mongoose';
import { Leaderboard } from '../schemas/leaderboard.schema';

export interface LeaderboardProfile extends Omit<Leaderboard, 'podId' | 'competitionId'> {
  podId?: string;
  competitionId?: string;
} 