export enum AuthProvider {
  GOOGLE = 'google',
  EMAIL = 'email',
}

export enum AssetType {
  IMAGE = 'image',
  AVATAR = 'avatar',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum TwoFactorMethod {
  EMAIL = 'email',
  SMS = 'sms',
  AUTHENTICATOR = 'authenticator',
}

export enum TradingStyle {
  DAY_TRADING = 'day_trading',
  SWING_TRADING = 'swing_trading',
  POSITION_TRADING = 'position_trading',
  SCALPING = 'scalping',
}

export enum MarketType {
  STOCKS = 'stocks',
  CRYPTO = 'crypto',
  FOREX = 'forex',
  FUTURES = 'futures',
}

export enum TimeFrame {
  M1 = '1m',
  M5 = '5m',
  M15 = '15m',
  M30 = '30m',
  H1 = '1h',
  H4 = '4h',
  D1 = '1d',
  W1 = '1w',
}
