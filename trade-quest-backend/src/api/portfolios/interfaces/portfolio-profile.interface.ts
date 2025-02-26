import { Types } from 'mongoose';
import { Portfolio } from '../schemas/portfolio.schema';

export interface PortfolioProfile extends Omit<Portfolio, 'userId'> {
  userId: string;
}
