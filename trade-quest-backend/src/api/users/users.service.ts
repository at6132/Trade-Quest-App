import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from 'src/api/auth/dto/register.dto';
import { AssetType } from 'src/common/enums';
import { UserProfile } from './interfaces/user-profile.interface';
import { Asset, AssetDocument } from '../assets/schemas/asset.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Asset.name)
    private assetModel: Model<AssetDocument>,
  ) {}

  async create(createUserDto: RegisterDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async verifyEmail(email: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate({ email }, { isVerified: true });
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.userModel.findById(userId).lean().exec();

    if (!user) {
      return null;
    }

    const avatar = await this.assetModel
      .findOne({
        uploadedBy: new Types.ObjectId(userId),
        type: AssetType.AVATAR,
        isActive: true,
      })
      .select('url')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      ...user,
      avatar: avatar?.url || null,
    } as UserProfile;
  }

  async update(
    userId: string,
    updateUserDto: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
  }
}
