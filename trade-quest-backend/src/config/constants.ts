export const JWT_EXPIRES_IN = '1d';
export const SALT_ROUNDS = 10;
export const DEFAULT_AVATAR = 'default-avatar.png';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const PASSWORD_ERROR_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
export const GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID';
export const GOOGLE_CLIENT_SECRET = 'GOOGLE_CLIENT_SECRET';
export const GOOGLE_CALLBACK_URL = 'GOOGLE_CALLBACK_URL';
export const MIN_TIER_KEY = 'minTier';
export const ROLES_KEY = 'roles';
export const EMAIL_REQUIRED = 'Email is required';
export const PASSWORD_REQUIRED = 'Password is required';
export const USER_NOT_FOUND = 'User not found';
export const USER_ALREADY_EXISTS = 'User already exists';
export const INVALID_2FA_METHOD = 'Invalid 2FA method';
export const NO_USER_FROM_GOOGLE = 'No user from google';
export const USER_NOT_AUTHENTICATED = 'User not authenticated';
export const INVALID_CREDENTIALS = 'Invalid credentials';
export const EMAIL_NOT_VERIFIED = 'Email not verified';
export const PHONE_NUMBER_REQUIRED = 'Phone number is required for SMS 2FA';
export const TWO_FACTOR_NOT_ENABLED = '2FA is not enabled';
export const INVALID_TOKEN = 'Invalid token';
export const MAIL_FROM_EMAIL = 'MAIL_FROM_EMAIL';
export const MAIL_FROM_NAME = 'MAIL_FROM_NAME';
