import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { Broker } from '../interfaces/broker.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderSide, OrderType } from '../../../common/enums';

export class KrakenBroker implements Broker {
  private readonly logger = new Logger(KrakenBroker.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    credentials: { apiKey: string; apiSecret: string },
    private configService: ConfigService,
  ) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.baseUrl = this.configService.get<string>('KRAKEN_API_URL')!;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/0/private/Balance', 'POST', {});
      return !!response.result;
    } catch (error) {
      this.logger.error(
        `Failed to validate Kraken credentials: ${error.message}`,
      );
      return false;
    }
  }

  async submitOrder(orderData: CreateOrderDto): Promise<string> {
    try {
      const payload: any = {
        pair: orderData.symbol,
        type: this.mapOrderSide(orderData.side),
        ordertype: this.mapOrderType(orderData.type),
        volume: orderData.quantity.toString(),
      };

      if (orderData.type === OrderType.LIMIT) {
        payload.price = orderData?.price?.toString();
      }

      if (orderData.type === OrderType.STOP) {
        payload.price = orderData?.stopPrice?.toString();
      }

      if (orderData.type === OrderType.STOP_LIMIT) {
        payload.price = orderData?.price?.toString();
        payload.price2 = orderData?.stopPrice?.toString();
      }

      const response = await this.makeRequest(
        '/0/private/AddOrder',
        'POST',
        payload,
      );
      return response.result.txid[0];
    } catch (error) {
      this.logger.error(`Failed to submit order to Kraken: ${error.message}`);
      throw new Error(`Order submission failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const params = {
        txid: orderId,
      };
      const response = await this.makeRequest(
        '/0/private/QueryOrders',
        'POST',
        params,
      );
      return response.result[orderId];
    } catch (error) {
      this.logger.error(
        `Failed to get order status from Kraken: ${error.message}`,
      );
      throw new Error(`Failed to get order status: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const params = {
        txid: orderId,
      };
      const response = await this.makeRequest(
        '/0/private/CancelOrder',
        'POST',
        params,
      );
      return !!response.result.count;
    } catch (error) {
      this.logger.error(`Failed to cancel order on Kraken: ${error.message}`);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const balanceResponse = await this.makeRequest(
        '/0/private/Balance',
        'POST',
        {},
      );
      return {
        balances: balanceResponse.result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get account info from Kraken: ${error.message}`,
      );
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string,
    params: any = {},
  ): Promise<any> {
    try {
      const nonce = Date.now().toString();
      const url = `${this.baseUrl}${endpoint}`;

      // Add nonce to params
      params.nonce = nonce;

      // Create signature
      const signature = this.createSignature(endpoint, params, nonce);

      const response = await axios({
        method,
        url,
        data: method === 'POST' ? params : undefined,
        params: method === 'GET' ? params : undefined,
        headers: {
          'API-Key': this.apiKey,
          'API-Sign': signature,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.error && response.data.error.length > 0) {
        throw new Error(response.data.error.join(', '));
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Kraken API request failed: ${error.message}`);
      throw error;
    }
  }

  private createSignature(path: string, params: any, nonce: string): string {
    const postData = new URLSearchParams(params).toString();
    const secret = Buffer.from(this.apiSecret, 'base64');
    const message =
      path +
      crypto
        .createHash('sha256')
        .update(nonce + postData)
        .digest('binary');

    return crypto.createHmac('sha512', secret).update(message).digest('base64');
  }

  private mapOrderSide(side: OrderSide): string {
    switch (side) {
      case OrderSide.BUY:
        return 'buy';
      case OrderSide.SELL:
        return 'sell';
      default:
        return 'buy';
    }
  }

  private mapOrderType(type: OrderType): string {
    switch (type) {
      case OrderType.MARKET:
        return 'market';
      case OrderType.LIMIT:
        return 'limit';
      case OrderType.STOP:
        return 'stop-loss';
      case OrderType.STOP_LIMIT:
        return 'stop-loss-limit';
      default:
        return 'market';
    }
  }
}
