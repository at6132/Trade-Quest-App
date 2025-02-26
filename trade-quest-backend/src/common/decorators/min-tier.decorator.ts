import { SetMetadata } from '@nestjs/common';
import { MIN_TIER_KEY } from 'src/config/constants';

export const MinTier = (tier: number) => SetMetadata(MIN_TIER_KEY, tier);
