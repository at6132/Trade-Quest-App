import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthProvider, TwoFactorMethod, Role } from 'src/common/enums';
import { Asset } from '../../assets/schemas/asset.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
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
