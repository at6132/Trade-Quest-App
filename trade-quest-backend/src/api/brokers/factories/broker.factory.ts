import { ConfigService } from '@nestjs/config';
import { BrokerType, AssetClass } from '../../../common/enums';

// Stock brokers
import { AlpacaBroker } from '../implementations/alpaca.broker';
import { InteractiveBrokersBroker } from '../implementations/interactive-brokers.broker';
import { TradierBroker } from '../implementations/tradier.broker';

// Crypto brokers
import { BinanceBroker } from '../implementations/binance.broker';

// Forex brokers
import { OandaBroker } from '../implementations/oanda.broker';
import { FxcmBroker } from '../implementations/fxcm.broker';

export class BrokerFactory {
  static createBroker(
    type: BrokerType,
    credentials: any,
    configService: ConfigService,
  ) {
    switch (type) {
      // Stock brokers
      case BrokerType.ALPACA:
        return new AlpacaBroker(credentials, configService);
      case BrokerType.INTERACTIVE_BROKERS:
        return new InteractiveBrokersBroker(credentials, configService);
      case BrokerType.TRADIER:
        return new TradierBroker(credentials, configService);


      // Crypto brokers
      case BrokerType.BINANCE:
        return new BinanceBroker(credentials, configService);

      // Forex brokers
      case BrokerType.OANDA:
        return new OandaBroker(credentials, configService);
      case BrokerType.FXCM:
        return new FxcmBroker(credentials, configService);

      default:
        throw new Error(`Unsupported broker type: ${type}`);
    }
  }

  static getBrokerAssetClass(type: BrokerType): AssetClass {
    switch (type) {
      case BrokerType.ALPACA:
      case BrokerType.INTERACTIVE_BROKERS:
      case BrokerType.TRADIER:
        return AssetClass.STOCKS;

      case BrokerType.BINANCE:
        return AssetClass.CRYPTO;

      case BrokerType.OANDA:
      case BrokerType.FXCM:
        return AssetClass.FOREX;

      default:
        throw new Error(`Unknown asset class for broker type: ${type}`);
    }
  }

  static getBrokersByAssetClass(assetClass: AssetClass): BrokerType[] {
    switch (assetClass) {
      case AssetClass.STOCKS:
        return [
          BrokerType.ALPACA,
          BrokerType.INTERACTIVE_BROKERS,
          BrokerType.TRADIER,
        ];

      case AssetClass.FUTURES:
        return []; // Futures will be added later

      case AssetClass.CRYPTO:
        return [BrokerType.BINANCE]; // Only Binance for crypto

      case AssetClass.FOREX:
        return [BrokerType.OANDA, BrokerType.FXCM];

      default:
        return [];
    }
  }
}
