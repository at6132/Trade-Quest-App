import { TwoFactorMethod } from 'src/common/enums';

export interface TwoFactorSetupResponse {
  tfaMethod: TwoFactorMethod;
  qrCode?: string;
}
