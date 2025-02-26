import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MIN_TIER_KEY } from 'src/config/constants';
@Injectable()
export class TierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<number>(
      MIN_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTier) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return user?.tier >= requiredTier;
  }
}
