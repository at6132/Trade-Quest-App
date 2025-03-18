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
      case BrokerType.KRAKEN:
        return this.getKrakenAuthUrl();
      case BrokerType.COINBASE:
        return this.getCoinbaseAuthUrl();
      default:
        throw new Error(`OAuth not supported for broker: ${brokerType}`);
    }
  }

  private getAlpacaAuthUrl(): string {
    const clientId = this.configService.get<string>('ALPACA_CLIENT_ID');
    const redirectUri = this.configService.get<string>('ALPACA_REDIRECT_URI');
    const authUrl = this.configService.get<string>('ALPACA_AUTH_URL');

    return `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=account:write%20trading`;
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

  private getBinanceAuthUrl(): string {
    const clientId = this.configService.get<string>('BINANCE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('BINANCE_REDIRECT_URI');

    return `https://accounts.binance.com/en/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email,trade`;
  }

  private getOandaAuthUrl(): string {
    const clientId = this.configService.get<string>('OANDA_CLIENT_ID');
    const redirectUri = this.configService.get<string>('OANDA_REDIRECT_URI');

    return `https://oauth.oanda.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=read,trade`;
  }

  private getFxcmAuthUrl(): string {
    const clientId = this.configService.get<string>('FXCM_CLIENT_ID');
    const redirectUri = this.configService.get<string>('FXCM_REDIRECT_URI');

    return `https://api.fxcm.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=trading`;
  }

  private getKrakenAuthUrl(): string {
    const clientId = this.configService.get<string>('KRAKEN_CLIENT_ID');
    const redirectUri = this.configService.get<string>('KRAKEN_REDIRECT_URI');

    return `https://auth.kraken.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=trade`;
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
    switch (brokerType) {
      case BrokerType.ALPACA:
        return this.handleAlpacaCallback(code);
      case BrokerType.INTERACTIVE_BROKERS:
        return this.handleIBCallback(code);
      case BrokerType.TRADIER:
        return this.handleTradierCallback(code);
      case BrokerType.BINANCE:
        return this.handleBinanceCallback(code);
      case BrokerType.OANDA:
        return this.handleOandaCallback(code);
      case BrokerType.FXCM:
        return this.handleFxcmCallback(code);
      case BrokerType.KRAKEN:
        return this.handleKrakenCallback(code);
      case BrokerType.COINBASE:
        return this.handleCoinbaseCallback(code);
      default:
        throw new Error(
          `OAuth callback not implemented for broker: ${brokerType}`,
        );
    }
  }

  private async handleAlpacaCallback(code: string): Promise<any> {
    try {
      const clientId = this.configService.get<string>('ALPACA_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'ALPACA_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>('ALPACA_REDIRECT_URI');
      const tokenUrl =
        this.configService.get<string>('ALPACA_TOKEN_URL') ||
        'https://api.alpaca.markets/oauth/token';

      const response = await axios.post(tokenUrl, {
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle Alpaca OAuth callback: ${error.message}`,
      );
      throw new Error(`Authentication with Alpaca failed: ${error.message}`);
    }
  }

  private async handleBinanceCallback(code: string): Promise<any> {
    try {
      const clientId = this.configService.get<string>('BINANCE_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'BINANCE_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>(
        'BINANCE_REDIRECT_URI',
      );

      const response = await axios.post(
        'https://api.binance.com/api/v3/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        },
      );

      return {
        apiKey: response.data.api_key,
        apiSecret: response.data.api_secret,
        accessToken: response.data.access_token,
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle Binance OAuth callback: ${error.message}`,
      );
      throw new Error(`Authentication with Binance failed: ${error.message}`);
    }
  }

  // Implement other broker callbacks similarly
  private async handleIBCallback(code: string): Promise<any> {
    // Implementation for Interactive Brokers
    return {};
  }

  private async handleTradierCallback(code: string): Promise<any> {
    // Implementation for Tradier
    return {};
  }

  private async handleOandaCallback(code: string): Promise<any> {
    // Implementation for OANDA
    return {};
  }

  private async handleFxcmCallback(code: string): Promise<any> {
    // Implementation for FXCM
    return {};
  }

  private async handleKrakenCallback(code: string): Promise<any> {
    try {
      const clientId = this.configService.get<string>('KRAKEN_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'KRAKEN_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>('KRAKEN_REDIRECT_URI');

      const response = await axios.post(
        'https://auth.kraken.com/oauth2/token',
        {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        },
      );

      return {
        apiKey: response.data.access_token,
        apiSecret: response.data.refresh_token,
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle Kraken OAuth callback: ${error.message}`,
      );
      throw new Error(`Authentication with Kraken failed: ${error.message}`);
    }
  }

  private async handleCoinbaseCallback(code: string): Promise<any> {
    try {
      const clientId = this.configService.get<string>('COINBASE_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'COINBASE_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>(
        'COINBASE_REDIRECT_URI',
      );

      const response = await axios.post(
        'https://api.coinbase.com/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        },
      );

      return {
        apiKey: response.data.access_token,
        apiSecret: response.data.refresh_token,
        passphrase: '', // Coinbase Pro requires a passphrase, which would need to be provided by the user
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle Coinbase OAuth callback: ${error.message}`,
      );
      throw new Error(`Authentication with Coinbase failed: ${error.message}`);
    }
  }
}
