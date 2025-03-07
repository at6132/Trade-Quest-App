import { SetMetadata } from '@nestjs/common';
import CONSTANTS from '../constants';

export const MinTier = (tier: number) =>
  SetMetadata(CONSTANTS.MIN_TIER_KEY, tier);
