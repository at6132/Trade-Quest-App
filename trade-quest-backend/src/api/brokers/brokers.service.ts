import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BrokerConnection,
  BrokerConnectionDocument,
} from './schemas/broker-connection.schema';
import { BrokerType, OrderStatus, AssetClass } from 'src/common/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { BrokerFactory } from './factories/broker.factory';

@Injectable()
export class BrokersService {
  private readonly logger = new Logger(BrokersService.name);
  private orderStatusChecks = new Map<string, NodeJS.Timeout>();

  constructor(
    private configService: ConfigService,
    @InjectModel(BrokerConnection.name)
    private brokerConnectionModel: Model<BrokerConnectionDocument>,
    private ordersService: OrdersService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // Find user's broker connection
    const brokerConnection = await this.brokerConnectionModel.findOne({
      userId,
      isActive: true,
    });

    if (!brokerConnection) {
      throw new NotFoundException('No active broker connection found');
    }

    // Create broker instance using factory
    const broker = BrokerFactory.createBroker(
      brokerConnection.brokerType,
      brokerConnection.credentials,
      this.configService,
    );

    // Submit order to broker
    const brokerOrderId = await broker.submitOrder(createOrderDto);

    // Save order to database
    const order = await this.ordersService.createOrder({
      userId,
      brokerConnectionId: brokerConnection._id,
      brokerOrderId,
      symbol: createOrderDto.symbol,
      side: createOrderDto.side,
      type: createOrderDto.type,
      quantity: createOrderDto.quantity,
      price: createOrderDto.price,
      stopPrice: createOrderDto.stopPrice,
      status: OrderStatus.SUBMITTED,
      assetClass: brokerConnection.assetClass,
    });

    // Start tracking order status
    this.trackOrderStatus((order as any)._id.toString(), broker, brokerOrderId);

    return order;
  }

  private trackOrderStatus(
    orderId: string,
    broker: any,
    brokerOrderId: string,
  ) {
    const checkStatus = async () => {
      try {
        const statusResponse = await broker.getOrderStatus(brokerOrderId);
        const status = this.mapBrokerStatus(statusResponse.status);

        await this.ordersService.updateOrderStatus(
          orderId,
          status,
          statusResponse,
        );

        // Handle filled orders separately from other final states
        if (
          status === OrderStatus.FILLED ||
          status === OrderStatus.PARTIALLY_FILLED
        ) {
          await this.ordersService.updateFilledDetails(
            orderId,
            statusResponse.filled_avg_price || statusResponse.filled_price,
            statusResponse.filled_qty,
            statusResponse.commission || 0,
          );
        }

        // Check if it's any final state to stop tracking
        if (
          [
            OrderStatus.FILLED,
            OrderStatus.CANCELED,
            OrderStatus.REJECTED,
            OrderStatus.EXPIRED,
          ].includes(status)
        ) {
          clearInterval(this.orderStatusChecks.get(orderId));
          this.orderStatusChecks.delete(orderId);
        }
      } catch (error) {
        this.logger.error(`Error checking order status: ${error.message}`);
      }
    };

    // Check immediately and then every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    this.orderStatusChecks.set(orderId, interval);
  }

  private mapBrokerStatus(brokerStatus: string): OrderStatus {
    // This mapping will be different for each broker
    // This is a simplified example for Alpaca
    switch (brokerStatus.toLowerCase()) {
      case 'new':
        return OrderStatus.SUBMITTED;
      case 'accepted':
      case 'pending_new':
        return OrderStatus.ACCEPTED;
      case 'partially_filled':
        return OrderStatus.PARTIALLY_FILLED;
      case 'filled':
        return OrderStatus.FILLED;
      case 'canceled':
      case 'pending_cancel':
        return OrderStatus.CANCELED;
      case 'rejected':
        return OrderStatus.REJECTED;
      case 'expired':
        return OrderStatus.EXPIRED;
      default:
        return OrderStatus.PENDING;
    }
  }

  async connectBroker(
    userId: string,
    brokerType: BrokerType,
    credentials: any,
    isDemo: boolean = false,
  ) {
    // Validate credentials with broker
    const broker = BrokerFactory.createBroker(
      brokerType,
      credentials,
      this.configService,
    );

    const isValid = await broker.validateCredentials();

    if (!isValid) {
      throw new Error('Invalid broker credentials');
    }

    // Get account info
    const accountInfo = await broker.getAccountInfo();

    // Get asset class for this broker type
    const assetClass = BrokerFactory.getBrokerAssetClass(brokerType);

    // Save broker connection
    const brokerConnection = new this.brokerConnectionModel({
      userId,
      brokerType,
      assetClass,
      credentials,
      isActive: true,
      lastConnected: new Date(),
      accountInfo,
      isDemo,
    });

    return await brokerConnection.save();
  }

  async getBrokerConnections(userId: string) {
    return this.brokerConnectionModel.find({ userId });
  }

  async getBrokerConnectionsByAssetClass(
    userId: string,
    assetClass: AssetClass,
  ) {
    return this.brokerConnectionModel.find({ userId, assetClass });
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.ordersService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (
      order.status === OrderStatus.FILLED ||
      order.status === OrderStatus.CANCELED ||
      order.status === OrderStatus.REJECTED ||
      order.status === OrderStatus.EXPIRED
    ) {
      throw new Error(`Cannot cancel order in ${order.status} state`);
    }

    const brokerConnection = await this.brokerConnectionModel.findById(
      order.brokerConnectionId,
    );

    if (!brokerConnection) {
      throw new NotFoundException('Broker connection not found');
    }

    const broker = BrokerFactory.createBroker(
      brokerConnection.brokerType,
      brokerConnection.credentials,
      this.configService,
    );

    const success = await broker.cancelOrder(order.brokerOrderId);

    if (success) {
      await this.ordersService.updateOrderStatus(orderId, OrderStatus.CANCELED);

      // Stop tracking this order
      if (this.orderStatusChecks.has(orderId)) {
        clearInterval(this.orderStatusChecks.get(orderId));
        this.orderStatusChecks.delete(orderId);
      }
    }

    return success;
  }
}
