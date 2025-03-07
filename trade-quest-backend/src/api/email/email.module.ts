import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { ConfigModule } from '@nestjs/config';
import { NodemailerProvider } from './providers/nodemailer.provider';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailTemplatesService, NodemailerProvider],
  exports: [EmailService, EmailTemplatesService],
})
export class EmailModule {}
