import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../api/users/schemas/user.schema';
import { AssetType } from 'src/config/enums';

export type AssetDocument = HydratedDocument<Asset>;

@Schema({ timestamps: true })
export class Asset {
  id: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, maxlength: 1000 })
  url: string;

  @Prop({ required: true, enum: AssetType })
  type: AssetType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPublic: boolean;
}

const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ uploadedBy: 1 });
AssetSchema.index({ type: 1 });
AssetSchema.index({ filename: 1 });
AssetSchema.index({ createdAt: -1 });

export { AssetSchema };

