import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplatesService } from './templates/email-templates.service';
import MESSAGES from 'src/common/messages';
import CONSTANTS from 'src/common/constants';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(CONSTANTS.NODEMAILER) private transporter: nodemailer.Transporter,
    private configService: ConfigService,
    private emailTemplatesService: EmailTemplatesService,
  ) {}

  async sendMail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<boolean> {
    try {
      const { to, subject, text, html } = options;
      const emailConfig = this.configService.get('email');

      await this.transporter.sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendVerificationEmail(
    name: string,
    email: string,
    token: string,
  ): Promise<boolean> {
    const html = this.emailTemplatesService.getVerificationEmailTemplate(
      name,
      token,
    );
    return await this.sendMail({
      to: email,
      subject: MESSAGES.VERIFICATION_EMAIL_HEADER,
      html,
    });
  }

  async sendOtpEmail(
    name: string,
    email: string,
    otp: string,
  ): Promise<boolean> {
    const html = this.emailTemplatesService.getOtpEmailTemplate(name, otp);
    return await this.sendMail({
      to: email,
      subject: MESSAGES.OTP_EMAIL_HEADER,
      html,
    });
  }
}
