// dto for request disable 2fa

import { IsNotEmpty, IsString } from 'class-validator';

export class RequestDisable2faDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
