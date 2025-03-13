const MESSAGES = {
  // Auth
  PASSWORD_ERROR_MESSAGE:
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  INVALID_PASSWORD: 'Invalid password',
  INVALID_OTP: 'Invalid OTP',
  OTP_VERIFIED_SUCCESSFULLY: 'OTP verified successfully',
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
  PROFILE_FETCHED_SUCCESSFULLY: 'Profile fetched successfully',

  // Two Factor
  INVALID_2FA_METHOD: 'Invalid 2FA method',
  PHONE_NUMBER_REQUIRED: 'Phone number is required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TWO_FACTOR_NOT_ENABLED: '2FA is not enabled',
  INVALID_TOKEN: 'Invalid token',
  TWO_FACTOR_SETUP_INITIATED: '2FA setup initiated',
  TWO_FACTOR_ENABLED: '2FA enabled successfully',
  TWO_FACTOR_DISABLED: '2FA disabled successfully',
  VERIFY_2FA: 'Verify 2FA',
  EMAIL_TFA_ENABLED:
    'Email-based two-factor authentication is enabled. Please check your inbox for the OTP.',
  SMS_TFA_ENABLED:
    'SMS-based two-factor authentication is enabled. Please check your phone for the OTP.',
  AUTHENTICATOR_TFA_ENABLED:
    'Authenticator-based two-factor authentication is enabled. Please open your Authenticator app for the OTP.',

  // Email
  OTP_EMAIL_HEADER: 'OTP for 2FA Verification',
  VERIFICATION_EMAIL_HEADER: 'Verify your email',
  EMAIL_VERIFICATION_SENT: 'Verification email has been sent',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',

  // SMS
  OTP_SMS_MESSAGE:
    'Your verification code is: otp. This code will expire in 5 minutes.',
  INVALID_CAPTCHA: 'Invalid CAPTCHA verification',
  INVALID_SESSION: 'Invalid or expired session',

  // Sessions
  SESSION_TERMINATED_SUCCESSFULLY: 'Session terminated successfully',
  SESSIONS_FETCHED_SUCCESSFULLY: 'Sessions fetched successfully',

  // User Profile
  EMAIL_ALREADY_EXISTS: 'Email is already in use',
  USERNAME_ALREADY_EXISTS: 'Username is already taken',
  PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully',
  PREFERENCES_UPDATED_SUCCESSFULLY: 'Preferences updated successfully',
  PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully',
  INVALID_FILE_TYPE: 'Invalid file type',
};

export default MESSAGES;
