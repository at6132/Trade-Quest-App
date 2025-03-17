import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BrokerType } from 'src/common/enums';

@Injectable()
export class BrokerAuthService {
  private readonly logger = new Logger(BrokerAuthService.name);

  constructor(private configService: ConfigService) {}

  getAuthUrl(brokerType: BrokerType): string {
    switch (brokerType) {
      case BrokerType.ALPACA:
        return this.getAlpacaAuthUrl();
      case BrokerType.INTERACTIVE_BROKERS:
        return this.getIBAuthUrl();
      case BrokerType.TRADIER:
        return this.getTradierAuthUrl();
      case BrokerType.BINANCE:
        return this.getBinanceAuthUrl();
      case BrokerType.OANDA:
        return this.getOandaAuthUrl();
      case BrokerType.FXCM:
        return this.getFxcmAuthUrl();
      default:
        throw new Error(`OAuth not supported for broker: ${brokerType}`);
    }
  }

  private getAlpacaAuthUrl(): string {
    const clientId = this.configService.get<string>('ALPACA_CLIENT_ID');
    const redirectUri = this.configService.get<string>('ALPACA_REDIRECT_URI');

    return `https://app.alpaca.markets/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=account:write%20trading`;
  }

  private getIBAuthUrl(): string {
    const clientId = this.configService.get<string>('IB_CLIENT_ID');
    const redirectUri = this.configService.get<string>('IB_REDIRECT_URI');

    return `https://www.interactivebrokers.com/en/index.php?f=oauth&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  private getTradierAuthUrl(): string {
    const clientId = this.configService.get<string>('TRADIER_CLIENT_ID');
    const redirectUri = this.configService.get<string>('TRADIER_REDIRECT_URI');

    return `https://api.tradier.com/v1/oauth/authorize?client_id=${clientId}&scope=read,write,market,trade&redirect_uri=${redirectUri}`;
  }

  private getCoinbaseAuthUrl(): string {
    const clientId = this.configService.get<string>('COINBASE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('COINBASE_REDIRECT_URI');

    return `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=wallet:accounts:read,wallet:buys:create,wallet:sells:create`;
  }

  async handleOAuthCallback(
    brokerType: BrokerType,
    code: string,
    userId: string,
  ): Promise<any> {
    // Implementation to exchange the authorization code for access tokens
    // This will be different for each broker
    // Returns the credentials to be stored
  }
}
