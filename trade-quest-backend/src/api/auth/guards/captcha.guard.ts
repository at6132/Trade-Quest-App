import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { CaptchaService } from '../captcha/captcha.service';
import MESSAGES from 'src/common/messages';
@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private captchaService: CaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recaptchaToken = request.headers['x-recaptcha-token'];

    if (!recaptchaToken) {
      throw new BadRequestException(MESSAGES.INVALID_CAPTCHA);
    }

    return await this.captchaService.verifyCaptcha(recaptchaToken);
  }
}
