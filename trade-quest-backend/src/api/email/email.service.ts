import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const emailConfig = this.configService.get('email');
    
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }

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
} 