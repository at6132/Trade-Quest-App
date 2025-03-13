import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateRiskSettingsDto } from './dto/update-risk-settings.dto';
import MESSAGES from 'src/common/messages';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './schemas/user.schema';
import { LocalFileUploadInterceptor } from '../../common/interceptors/local-file-upload.interceptor';
// import { S3FileUploadInterceptor } from '../../common/interceptors/file-upload/s3-file-upload.interceptor';
import { FileUploadService } from '../../common/services/file-upload.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private fileUploadService: FileUploadService,
  ) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as User;
    const profile = await this.usersService.getProfile(user._id);
    return profile
      ? {
          message: MESSAGES.PROFILE_FETCHED_SUCCESSFULLY,
          data: { profile },
        }
      : { message: MESSAGES.USER_NOT_FOUND };
  }

  @Patch('profile')
  @UseInterceptors(
    LocalFileUploadInterceptor({
      fieldName: 'avatar',
      destination: './uploads/avatars',
      limits: {
        fileSize: 1024 * 1024, // 1MB
      },
    }),
    // Alternatively, use S3:
    // S3FileUploadInterceptor({
    //   fieldName: 'avatar',
    //   destination: 'avatars',
    //   limits: {
    //     fileSize: 1024 * 1024, // 1MB
    //   },
    // })
  )
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user as User;

    if (file) {
      updateProfileDto['avatar'] =
        this.fileUploadService.getLocalFileUrl(file) || undefined;
      if (user.avatar) {
        await this.fileUploadService.deleteLocalFile(user.avatar);
      }
    }

    const updatedUser = await this.usersService.updateProfile(
      user._id,
      updateProfileDto,
    );

    return {
      message: MESSAGES.PROFILE_UPDATED_SUCCESSFULLY,
      data: updatedUser,
    };
  }

  @Patch('preferences')
  async updatePreferences(
    @Req() req: Request,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    const user = req.user as User;
    const updatedUser = await this.usersService.updatePreferences(
      user._id,
      updatePreferencesDto,
    );

    return updatedUser
      ? {
          message: MESSAGES.PREFERENCES_UPDATED_SUCCESSFULLY,
          data: updatedUser.preferences,
        }
      : { message: MESSAGES.USER_NOT_FOUND };
  }

  @Patch('risk-settings')
  async updateRiskSettings(
    @Req() req: Request,
    @Body() updateRiskSettingsDto: UpdateRiskSettingsDto,
  ) {
    const user = req.user as User;
    const updatedUser = await this.usersService.updateRiskSettings(
      user._id,
      updateRiskSettingsDto,
    );

    return updatedUser
      ? {
          message: MESSAGES.RISK_SETTINGS_UPDATED_SUCCESSFULLY,
          data: updatedUser.riskSettings,
        }
      : { message: MESSAGES.USER_NOT_FOUND };
  }

  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user as User;

    return await this.usersService.changePassword(
      user,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
