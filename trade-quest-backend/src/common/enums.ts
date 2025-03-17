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

export enum ChartType {
  CANDLESTICK = 'candlestick',
  LINE = 'line',
  BAR = 'bar',
  HEIKINASHI = 'heikinashi',
  AREA = 'area',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stopLimit',
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

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum BrokerType {
  // Stocks
  ALPACA = 'ALPACA',
  INTERACTIVE_BROKERS = 'INTERACTIVE_BROKERS',
  TRADIER = 'TRADIER',

  // Crypto
  BINANCE = 'BINANCE',

  // Forex
  OANDA = 'OANDA',
  FXCM = 'FXCM',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum AssetClass {
  STOCKS = 'STOCKS',
  FUTURES = 'FUTURES',
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
}
