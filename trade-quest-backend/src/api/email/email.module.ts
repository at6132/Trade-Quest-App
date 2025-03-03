import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailTemplatesService],
  exports: [EmailService, EmailTemplatesService],
})
export class EmailModule {} 