import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Asset, AssetSchema } from '../assets/schemas/asset.schema';
import { UsersController } from './users.controller';
import { SharedModule } from '../../common/shared.module';
import { FileUploadService } from '../../common/services/file-upload.service';
import { S3Config } from '../../config/s3.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    SharedModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, FileUploadService, S3Config],
  exports: [UsersService],
})
export class UsersModule {}
