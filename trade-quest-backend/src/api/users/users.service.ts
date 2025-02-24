import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from 'src/api/auth/dto/register.dto';
import { AssetType } from 'src/config/enums';
import { UserProfile } from './interfaces/user-profile.interface';
import { Asset, AssetDocument } from 'src/assets/schemas/asset.schema';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Asset.name)
    private assetModel: Model<AssetDocument>,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ 
      username: createUserDto.username 
    }).exec();
    
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    try {
      const user = new this.userModel(createUserDto);
      return await user.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.userModel
      .findById(userId)
      .select('-password -assets -__v')
      .lean()
      .exec();

    if (!user) {
      return null;
    }

    const avatar = await this.assetModel
      .findOne({
        uploadedBy: new Types.ObjectId(userId),
        type: AssetType.AVATAR,
        isActive: true
      })
      .select('url')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      ...user,
      avatar: avatar?.url || null
    } as UserProfile;
  }
} 