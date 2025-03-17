import { ConfigService } from '@nestjs/config';
import { BrokerType, AssetClass } from '../../../common/enums';

// Stock brokers
import { AlpacaBroker } from '../implementations/alpaca.broker';
import { InteractiveBrokersBroker } from '../implementations/interactive-brokers.broker';
import { TradierBroker } from '../implementations/tradier.broker';

// Futures brokers
import { CmeBroker } from '../implementations/cme.broker';
import { TradovateBroker } from '../implementations/tradovate.broker';

// Crypto brokers
import { BinanceBroker } from '../implementations/binance.broker';
import { KrakenBroker } from '../implementations/kraken.broker';
import { CoinbaseBroker } from '../implementations/coinbase.broker';

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

      // Futures brokers
      case BrokerType.CME:
        return new CmeBroker(credentials, configService);
      case BrokerType.TRADOVATE:
        return new TradovateBroker(credentials, configService);

      // Crypto brokers
      case BrokerType.BINANCE:
        return new BinanceBroker(credentials, configService);
      case BrokerType.KRAKEN:
        return new KrakenBroker(credentials, configService);
      case BrokerType.COINBASE:
        return new CoinbaseBroker(credentials, configService);

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

      case BrokerType.CME:
      case BrokerType.TRADOVATE:
        return AssetClass.FUTURES;

      case BrokerType.BINANCE:
      case BrokerType.KRAKEN:
      case BrokerType.COINBASE:
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
        return [BrokerType.CME, BrokerType.TRADOVATE];

      case AssetClass.CRYPTO:
        return [BrokerType.BINANCE, BrokerType.KRAKEN, BrokerType.COINBASE];

      case AssetClass.FOREX:
        return [BrokerType.OANDA, BrokerType.FXCM];

      default:
        return [];
    }
  }
}
