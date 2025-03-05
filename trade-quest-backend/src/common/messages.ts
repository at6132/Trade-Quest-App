const MESSAGES = {
  // Auth
  PASSWORD_ERROR_MESSAGE:
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK_URL: 'GOOGLE_CALLBACK_URL',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  EMAIL_NOT_VERIFIED: 'Email not verified',

  // Users
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  NO_USER_FROM_GOOGLE: 'No user from google',
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  USER_LOGGED_IN_SUCCESSFULLY: 'User logged in successfully',

  // Two Factor
  INVALID_2FA_METHOD: 'Invalid 2FA method',
  PHONE_NUMBER_REQUIRED: 'Phone number is required for SMS 2FA',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TWO_FACTOR_NOT_ENABLED: '2FA is not enabled',
  INVALID_TOKEN: 'Invalid token',

  // Email Verification
  VERIFICATION_EMAIL_HEADER: 'Verify your email',
  EMAIL_VERIFICATION_SENT: 'Verification email has been sent',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
};

export default MESSAGES;
