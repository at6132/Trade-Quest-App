import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokersService } from './brokers.service';
import { BrokersController } from './brokers.controller';
import { OrdersService } from './orders.service';
import { BrokerAuthService } from './broker-auth.service';
import { Order, OrderSchema } from './schemas/order.schema';
import {
  BrokerConnection,
  BrokerConnectionSchema,
} from './schemas/broker-connection.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: BrokerConnection.name, schema: BrokerConnectionSchema },
    ]),
  ],
  controllers: [BrokersController],
  providers: [BrokersService, OrdersService, BrokerAuthService],
  exports: [BrokersService, OrdersService, BrokerAuthService],
})
export class BrokersModule {}
