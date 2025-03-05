import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AssetType, AuthProvider } from 'src/common/enums';
import { AssetsService } from '../../assets/assets.service';
import MESSAGES from '../../../common/messages';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private assetsService: AssetsService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, _json } = profile;

    if (!emails?.[0]?.value) {
      done(new Error(MESSAGES.NO_USER_FROM_GOOGLE), undefined);
      return;
    }

    const existingUser = await this.usersService.findByEmail(emails[0].value);
    if (existingUser) {
      done(null, {
        id: existingUser._id.toString(),
        email: existingUser.email,
      });
      return;
    }

    const newUser = await this.usersService.create({
      email: emails[0].value,
      name: name?.givenName + ' ' + name?.familyName,
      username: emails[0].value,
      password: ' ',
      provider: AuthProvider.GOOGLE,
      isVerified: _json.email_verified || false,
    });

    await this.assetsService.create({
      filename: emails[0].value,
      originalname: emails[0].value,
      mimetype: 'image/png',
      size: 100,
      url: photos?.[0]?.value || '',
      type: AssetType.AVATAR,
      uploadedBy: newUser,
    });

    done(null, { id: newUser._id.toString(), email: newUser.email });
  }
}
