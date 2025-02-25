import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/config/enums';
import { ROLES_KEY } from 'src/config/constants';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles); 