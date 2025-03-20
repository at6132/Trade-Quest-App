import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { Broker } from '../interfaces/broker.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderSide, OrderType } from '../../../common/enums';

export class BinanceBroker implements Broker {
  private readonly logger = new Logger(BinanceBroker.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    credentials: { apiKey: string; apiSecret: string },
    private configService: ConfigService,
  ) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.baseUrl =
      this.configService.get<string>('BINANCE_API_URL') ||
      'https://api.binance.com';
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/api/v3/account', 'GET');
      return !!response.balances;
    } catch (error) {
      this.logger.error(
        `Failed to validate Binance credentials: ${error.message}`,
      );
      return false;
    }
  }

  async submitOrder(orderData: CreateOrderDto): Promise<string> {
    try {
      const payload: any = {
        symbol: orderData.symbol,
        side: this.mapOrderSide(orderData.side),
        type: this.mapOrderType(orderData.type),
        quantity: orderData.quantity,
        timestamp: Date.now(),
      };

      if (orderData.type === OrderType.LIMIT) {
        payload.timeInForce = 'GTC';
        payload.price = orderData.price;
      }

      if (orderData.type === OrderType.STOP) {
        payload.stopPrice = orderData.stopPrice;
      }

      if (orderData.type === OrderType.STOP_LIMIT) {
        payload.timeInForce = 'GTC';
        payload.price = orderData.price;
        payload.stopPrice = orderData.stopPrice;
      }

      const response = await this.makeRequest('/api/v3/order', 'POST', payload);
      return response.orderId;
    } catch (error) {
      this.logger.error(`Failed to submit order to Binance: ${error.message}`);
      throw new Error(`Order submission failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const params = {
        orderId,
        timestamp: Date.now(),
      };
      return await this.makeRequest('/api/v3/order', 'GET', params);
    } catch (error) {
      this.logger.error(
        `Failed to get order status from Binance: ${error.message}`,
      );
      throw new Error(`Failed to get order status: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const params = {
        orderId,
        timestamp: Date.now(),
      };
      await this.makeRequest('/api/v3/order', 'DELETE', params);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel order on Binance: ${error.message}`);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const params = {
        timestamp: Date.now(),
      };
      return await this.makeRequest('/api/v3/account', 'GET', params);
    } catch (error) {
      this.logger.error(
        `Failed to get account info from Binance: ${error.message}`,
      );
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string,
    params?: any,
  ): Promise<any> {
    try {
      // Add signature for authenticated endpoints
      let queryString = '';

      if (params) {
        const signature = this.generateSignature(params);
        params.signature = signature;

        queryString = Object.keys(params)
          .map((key) => `${key}=${encodeURIComponent(params[key])}`)
          .join('&');
      }

      const url = `${this.baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;

      const response = await axios({
        method,
        url,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Binance API request failed: ${error.message}`);
      throw error;
    }
  }

  private generateSignature(params: any): string {
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private mapOrderSide(side: OrderSide): string {
    switch (side) {
      case OrderSide.BUY:
        return 'BUY';
      case OrderSide.SELL:
        return 'SELL';
      default:
        return 'BUY';
    }
  }

  private mapOrderType(type: OrderType): string {
    switch (type) {
      case OrderType.MARKET:
        return 'MARKET';
      case OrderType.LIMIT:
        return 'LIMIT';
      case OrderType.STOP:
        return 'STOP_LOSS';
      case OrderType.STOP_LIMIT:
        return 'STOP_LOSS_LIMIT';
      default:
        return 'MARKET';
    }
  }
}
