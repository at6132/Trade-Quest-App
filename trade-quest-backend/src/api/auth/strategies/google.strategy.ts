import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AssetType, AuthProvider } from 'src/config/enums';
import { AssetsService } from '../../assets/assets.service';

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
      done(new Error('No email found from Google'), undefined);
      return;
    }

    const user = {
      email: emails[0].value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      accessToken,
    };

    const existingUser = await this.usersService.findByEmail(user.email);
    if (existingUser) {
      done(null, existingUser);
      return;
    }

    const newUser = await this.usersService.create({
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      username: user.email,
      password: ' ',
      provider: AuthProvider.GOOGLE,
      isVerified: _json.email_verified || false,
    });

    await this.assetsService.create({
      filename: user.email,
      originalname: user.email,
      mimetype: 'image/png',
      size: 100,
      url: user.picture,
      type: AssetType.AVATAR,
      uploadedBy: newUser,
    });

    done(null, newUser);
  }
} 