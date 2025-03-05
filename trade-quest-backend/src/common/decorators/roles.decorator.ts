import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';
import CONSTANTS from '../constants';

export const Roles = (...roles: Role[]) => SetMetadata(CONSTANTS.ROLES_KEY, roles);
