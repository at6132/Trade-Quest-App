import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Broker } from '../interfaces/broker.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderSide, OrderType } from '../../../common/enums';

export class AlpacaBroker implements Broker {
  private readonly logger = new Logger(AlpacaBroker.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(
    credentials: { apiKey: string; secretKey: string },
    private configService: ConfigService,
  ) {
    this.apiKey = credentials.apiKey;
    this.secretKey = credentials.secretKey;
    this.baseUrl =
      this.configService.get<string>('ALPACA_API_URL') ||
      'https://paper-api.alpaca.markets';
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/v2/account', 'GET');
      return !!response.account_number;
    } catch (error) {
      this.logger.error(
        `Failed to validate Alpaca credentials: ${error.message}`,
      );
      return false;
    }
  }

  async submitOrder(orderData: CreateOrderDto): Promise<string> {
    try {
      const payload: any = {
        symbol: orderData.symbol,
        qty: orderData.quantity,
        side: this.mapOrderSide(orderData.side),
        type: this.mapOrderType(orderData.type),
        time_in_force: 'day',
      };

      if (orderData.type === OrderType.LIMIT) {
        payload['limit_price'] = orderData.price;
      }

      if (orderData.type === OrderType.STOP) {
        payload['stop_price'] = orderData.stopPrice;
      }

      const response = await this.makeRequest('/v2/orders', 'POST', payload);
      return response.id;
    } catch (error) {
      this.logger.error(`Failed to submit order to Alpaca: ${error.message}`);
      throw new Error(`Order submission failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      return await this.makeRequest(`/v2/orders/${orderId}`, 'GET');
    } catch (error) {
      this.logger.error(
        `Failed to get order status from Alpaca: ${error.message}`,
      );
      throw new Error(`Failed to get order status: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/v2/orders/${orderId}`, 'DELETE');
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel order on Alpaca: ${error.message}`);
      return false;
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      return await this.makeRequest('/v2/account', 'GET');
    } catch (error) {
      this.logger.error(
        `Failed to get account info from Alpaca: ${error.message}`,
      );
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    method: string,
    data?: any,
  ): Promise<any> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Alpaca API request failed: ${error.message}`);
      throw error;
    }
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
      case OrderType.STOP_LIMIT:
        return 'stop_limit';
      default:
        return 'market';
    }
  }
}
