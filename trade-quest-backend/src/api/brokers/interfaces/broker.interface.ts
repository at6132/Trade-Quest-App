import { CreateOrderDto } from '../dto/create-order.dto';

export interface Broker {
  validateCredentials(): Promise<boolean>;
  submitOrder(orderData: CreateOrderDto): Promise<string>;
  getOrderStatus(orderId: string): Promise<any>;
  cancelOrder(orderId: string): Promise<boolean>;
  getAccountInfo(): Promise<any>;
}
