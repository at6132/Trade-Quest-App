import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from 'src/api/auth/dto/register.dto';
import { UserProfile } from './interfaces/user-profile.interface';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateRiskSettingsDto } from './dto/update-risk-settings.dto';
import MESSAGES from 'src/common/messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
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

    const { password, tfaSecret, tempOtp, ...userProfile } = user;
    return userProfile;
  }

  async update(
    userId: string,
    updateUserDto: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateProfileDto },
      { new: true },
    );

    if (!updatedUser) {
      return null;
    }

    const { password, tfaSecret, tempOtp, ...userProfile } =
      updatedUser.toObject();
    return userProfile;
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<UserProfile | null> {
    try {
      // Use dot notation to update specific fields within the preferences subdocument
      const updateObj = {};

      // Convert the DTO to dot notation for embedded document
      Object.keys(updatePreferencesDto).forEach((key) => {
        updateObj[`preferences.${key}`] = updatePreferencesDto[key];
      });

      // Update the document with the specific field updates
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateObj },
        { new: true },
      );

      if (!updatedUser) {
        return null;
      }

      const { password, tfaSecret, tempOtp, ...userProfile } =
        updatedUser.toObject();
      return userProfile;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return null;
    }
  }

  async updateRiskSettings(
    userId: string,
    updateRiskSettingsDto: UpdateRiskSettingsDto,
  ): Promise<UserProfile | null> {
    try {
      // Use dot notation to update specific fields within the riskSettings subdocument
      const updateObj = {};

      // Convert the DTO to dot notation for embedded document
      Object.keys(updateRiskSettingsDto).forEach((key) => {
        updateObj[`riskSettings.${key}`] = updateRiskSettingsDto[key];
      });

      // Update the document with the specific field updates
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateObj },
        { new: true },
      );

      if (!updatedUser) {
        return null;
      }

      const { password, tfaSecret, tempOtp, ...userProfile } =
        updatedUser.toObject();
      return userProfile;
    } catch (error) {
      console.error('Error updating risk settings:', error);
      return null;
    }
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message?: string }> {
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return { success: false, message: MESSAGES.INVALID_CURRENT_PASSWORD };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    return { success: true, message: MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY };
  }
}
