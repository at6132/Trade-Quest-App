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

import { KrakenBroker } from '../implementations/kraken.broker';
import { CoinbaseBroker } from '../implementations/coinbase.broker';

export class BrokerFactory {
  /**
   * Create a broker instance based on broker type
   */
  static createBroker(
    brokerType: BrokerType,
    credentials: any,
    configService: ConfigService,
  ): any {
    switch (brokerType) {
      case BrokerType.ALPACA:
        return new AlpacaBroker(credentials, configService);
      case BrokerType.INTERACTIVE_BROKERS:
        return new InteractiveBrokersBroker(credentials, configService);
      case BrokerType.TRADIER:
        return new TradierBroker(credentials, configService);
      case BrokerType.BINANCE:
        return new BinanceBroker(credentials, configService);
      case BrokerType.OANDA:
        return new OandaBroker(credentials, configService);
      case BrokerType.FXCM:
        return new FxcmBroker(credentials, configService);
      case BrokerType.KRAKEN:
        return new KrakenBroker(credentials, configService);
      case BrokerType.COINBASE:
        return new CoinbaseBroker(credentials, configService);
      default:
        throw new Error(`Broker type not supported: ${brokerType}`);
    }
  }

  /**
   * Get supported asset classes for a specific broker
   */
  static getSupportedAssetClasses(brokerType: BrokerType): AssetClass[] {
    switch (brokerType) {
      case BrokerType.INTERACTIVE_BROKERS:
        return [AssetClass.STOCKS, AssetClass.FOREX, AssetClass.CRYPTO];
      case BrokerType.ALPACA:
        return [AssetClass.STOCKS];
      case BrokerType.TRADIER:
        return [AssetClass.STOCKS];
      case BrokerType.BINANCE:
      case BrokerType.KRAKEN:
      case BrokerType.COINBASE:
        return [AssetClass.CRYPTO];
      case BrokerType.OANDA:
      case BrokerType.FXCM:
        return [AssetClass.FOREX];
      default:
        return [];
    }
  }

  /**
   * Get brokers that support a specific asset class
   */
  static getBrokersByAssetClass(assetClass: AssetClass): BrokerType[] {
    const brokers: BrokerType[] = [];

    Object.values(BrokerType).forEach((brokerType) => {
      if (this.getSupportedAssetClasses(brokerType).includes(assetClass)) {
        brokers.push(brokerType);
      }
    });

    return brokers;
  }

  /**
   * Check if a broker supports a specific asset class
   */
  static supportsBrokerAssetClass(
    brokerType: BrokerType,
    assetClass: AssetClass,
  ): boolean {
    return this.getSupportedAssetClasses(brokerType).includes(assetClass);
  }
}
