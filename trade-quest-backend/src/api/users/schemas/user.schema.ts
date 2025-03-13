import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  AuthProvider,
  TwoFactorMethod,
  Role,
  MarketType,
  TradingStyle,
  TimeFrame,
} from 'src/common/enums';
import { Asset } from '../../assets/schemas/asset.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class TradingPreferences {
  @Prop({ type: [String], enum: Object.values(MarketType), default: [] })
  preferredMarkets: MarketType[];

  @Prop({
    type: String,
    enum: TradingStyle,
    default: TradingStyle.SWING_TRADING,
  })
  tradingStyle: TradingStyle;

  @Prop({ type: [String], enum: Object.values(TimeFrame), default: [] })
  preferredTimeframes: TimeFrame[];
}

@Schema({ _id: false })
export class RiskSettings {
  @Prop({ type: Number, min: 0.1, max: 10, default: 2 })
  maxRiskPerTrade: number; // Percentage of account

  @Prop({ type: Number, min: 1, max: 20, default: 5 })
  maxDailyLoss: number; // Percentage of account

  @Prop({ type: Number, min: 1, max: 10, default: 1 })
  leveragePreference: number;

  @Prop({ type: Boolean, default: true })
  requireStopLoss: boolean;
}

@Schema({ _id: false })
export class TradingStatistics {
  @Prop({ type: Number, default: 0 })
  totalTrades: number;

  @Prop({ type: Number, default: 0 })
  winningTrades: number;

  @Prop({ type: Number, default: 0 })
  losingTrades: number;

  @Prop({ type: Number, default: 0 })
  profitFactor: number;

  @Prop({ type: Number, default: 0 })
  averageWin: number;

  @Prop({ type: Number, default: 0 })
  averageLoss: number;

  @Prop({ type: Number, default: 0 })
  largestWin: number;

  @Prop({ type: Number, default: 0 })
  largestLoss: number;

  @Prop({ type: Number, default: 0 })
  averageTradeDuration: number; // In minutes
}

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop()
  avatar: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ enum: AuthProvider, default: AuthProvider.EMAIL })
  provider: AuthProvider;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  tier: number;

  @Prop({ default: false })
  tfaEnabled: boolean;

  @Prop({ enum: TwoFactorMethod })
  tfaMethod: string;

  @Prop()
  tfaSecret: string;

  @Prop()
  tempOtp: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Asset' }] })
  assets: Asset[];

  @Prop({ type: TradingPreferences, default: () => ({}) })
  preferences: TradingPreferences;

  @Prop({ type: RiskSettings, default: () => ({}) })
  riskSettings: RiskSettings;

  @Prop({ type: TradingStatistics, default: () => ({}) })
  statistics: TradingStatistics;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  following: User[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  followers: User[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ type: Object, default: {} })
  socialLinks: Record<string, string>;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export { UserSchema };
