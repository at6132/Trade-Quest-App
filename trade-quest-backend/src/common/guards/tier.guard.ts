import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<number>(
      'minTier',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTier) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return user?.tier >= requiredTier;
  }
} 