import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import MESSAGES from 'src/common/messages';

@Injectable()
export class CaptchaService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async verifyCaptcha(token: string): Promise<boolean> {
    const secretKey = this.configService.get('RECAPTCHA_SECRET_KEY');
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${process.env.RECAPTCHA_URL}?secret=${secretKey}&response=${token}`,
      ),
    );

    if (!data.success) {
      throw new BadRequestException(MESSAGES.INVALID_CAPTCHA);
    }

    return true;
  }
}
