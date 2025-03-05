 const CONSTANTS = {
    JWT_EXPIRES_IN: '1d',
  SALT_ROUNDS: 10,  
  DEFAULT_AVATAR: 'default-avatar.png',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  PASSWORD_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    MIN_TIER_KEY: 'minTier',
  ROLES_KEY: 'roles',
};

export default CONSTANTS;
