import { User } from '../schemas/user.schema';

export interface UserProfile
  extends Omit<User, 'password' | 'assets' | 'tfaSecret' | 'tempOtp' | '__v'> {}
