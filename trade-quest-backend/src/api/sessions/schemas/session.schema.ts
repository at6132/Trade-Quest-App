import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ _id: false })
class DeviceInfo {
  @Prop()
  browser: string;

  @Prop()
  os: string;

  @Prop()
  device: string;

  @Prop()
  ip: string;
}

@Schema({ timestamps: true })
export class Session {
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ type: DeviceInfo })
  deviceInfo: DeviceInfo;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastActiveAt: Date;

  @Prop()
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
