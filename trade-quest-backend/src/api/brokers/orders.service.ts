import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderStatus } from 'src/common/enums';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(orderData: any): Promise<Order> {
    const order = new this.orderModel(orderData);
    return await order.save();
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    details?: any,
  ): Promise<Order> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
          ...(details && { details }),
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return updatedOrder;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async updateFilledDetails(
    orderId: string,
    filledPrice: number,
    filledQuantity: number,
    commission: number,
  ): Promise<Order | null> {
    // First get the order to check its quantity
    const order = await this.orderModel.findById(orderId);
    if (!order) return null;

    // Then update with the correct status based on filled quantity
    return this.orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          filledPrice,
          filledQuantity,
          commission,
          filledAt: new Date(),
          status:
            filledQuantity === order.quantity
              ? OrderStatus.FILLED
              : OrderStatus.PARTIALLY_FILLED,
        },
      },
      { new: true },
    );
  }
}
