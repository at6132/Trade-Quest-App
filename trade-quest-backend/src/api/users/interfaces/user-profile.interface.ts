import { User } from '../schemas/user.schema';

export interface UserProfile extends Omit<User, 'password' | 'avatar'> {
  avatar: string | null;
} 