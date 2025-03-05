import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import CONSTANTS from 'src/common/constants';

export const NodemailerProvider: Provider = {
  provide: CONSTANTS.NODEMAILER,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const emailConfig = configService.get('email');

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        // pass: "dbza oazk egys gebc",
        pass: emailConfig.password,
      },
    });

    return transporter;
  },
};
