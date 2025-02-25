import { SetMetadata } from '@nestjs/common';

export const MIN_TIER_KEY = 'minTier';
export const MinTier = (tier: number) => SetMetadata(MIN_TIER_KEY, tier); 