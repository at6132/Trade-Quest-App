import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LoginHistoryDocument = HydratedDocument<LoginHistory>;

@Schema({ timestamps: true })
export class LoginHistory {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  browser: string;

  @Prop({ required: true })
  os: string;

  @Prop({ required: true })
  device: string;
}

export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
LoginHistorySchema.index({ userId: 1 });
