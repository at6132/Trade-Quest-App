import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { Broker } from '../interfaces/broker.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderSide, OrderType } from '../../../common/enums';

export class CoinbaseBroker implements Broker {
  private readonly logger = new Logger(CoinbaseBroker.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly passphrase: string;

  constructor(
    credentials: { apiKey: string; apiSecret: string; passphrase: string },
    private configService: ConfigService,
  ) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.passphrase = credentials.passphrase;
    this.baseUrl = this.configService.get<string>('COINBASE_API_URL')!;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/accounts', 'GET');
      return Array.isArray(response);
    } catch (error) {
      this.logger.error(
        `Failed to validate Coinbase credentials: ${error.message}`,
      );
      return false;
    }
  }

  async submitOrder(orderData: CreateOrderDto): Promise<string> {
    try {
      const payload: any = {
        product_id: orderData.symbol,
        side: this.mapOrderSide(orderData.side),
        type: this.mapOrderType(orderData.type),
        size: orderData.quantity.toString(),
      };

      if (orderData.type === OrderType.LIMIT) {
        payload.price = orderData?.price?.toString();
      }

      if (orderData.type === OrderType.STOP) {
        payload.stop = orderData.side === OrderSide.BUY ? 'entry' : 'loss';
        payload.stop_price = orderData?.stopPrice?.toString();
      }

      const response = await this.makeRequest('/orders', 'POST', payload);
      return response.id;
    } catch (error) {
      this.logger.error(`Failed to submit order to Coinbase: ${error.message}`);
      throw new Error(`Order submission failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      return await this.makeRequest(`/orders/${orderId}`, 'GET');
    } catch (error) {
      this.logger.error(
        `Failed to get order status from Coinbase: ${error.message}`,
      );
      throw new Error(`Failed to get order status: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/orders/${orderId}`, 'DELETE');
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel order on Coinbase: ${error.message}`);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const accounts = await this.makeRequest('/accounts', 'GET');
      return {
        accounts,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get account info from Coinbase: ${error.message}`,
      );
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string,
    body: any = {},
  ): Promise<any> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const url = `${this.baseUrl}${endpoint}`;

      // Create signature
      const requestPath = endpoint;
      const bodyString = method === 'GET' ? '' : JSON.stringify(body);
      const signature = this.createSignature(
        timestamp,
        method,
        requestPath,
        bodyString,
      );

      const response = await axios({
        method,
        url,
        data: method === 'GET' ? undefined : body,
        headers: {
          'CB-ACCESS-KEY': this.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'CB-ACCESS-PASSPHRASE': this.passphrase,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Coinbase API request failed: ${error.message}`);
      throw error;
    }
  }

  private createSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string,
  ): string {
    const message = timestamp + method + requestPath + body;
    const key = Buffer.from(this.apiSecret, 'base64');
    return crypto.createHmac('sha256', key).update(message).digest('base64');
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
        return 'stop';
      default:
        return 'market';
    }
  }
}
