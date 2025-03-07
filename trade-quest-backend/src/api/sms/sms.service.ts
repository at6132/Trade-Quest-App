import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MESSAGES from 'src/common/messages';
import * as twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export class SmsService {
  private readonly client: twilio.Twilio;
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string): Promise<MessageInstance> {
    try {
      const message = await this.client.messages.create({
        body,
        to,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
      });

      this.logger.log(`SMS sent successfully to ${to}`);
      return message;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error}`);
      throw error;
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = MESSAGES.OTP_SMS_MESSAGE.replace('otp', otp);
    await this.sendSms(phoneNumber, message);
    return true;
  }
}
