import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BrokersService } from './brokers.service';
import { OrdersService } from './orders.service';
import { BrokerAuthService } from './broker-auth.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConnectBrokerDto } from './dto/connect-broker.dto';
import { BrokerType, AssetClass } from 'src/common/enums';
import { Request, Response } from 'express';
import { User } from '../users/schemas/user.schema';
import { BrokerFactory } from './factories/broker.factory';

@Controller('brokers')
@UseGuards(JwtAuthGuard)
export class BrokersController {
  constructor(
    private readonly brokersService: BrokersService,
    private readonly ordersService: OrdersService,
    private readonly brokerAuthService: BrokerAuthService,
  ) {}

  @Get('asset-classes')
  getAssetClasses() {
    return {
      message: 'Asset classes retrieved successfully',
      data: Object.values(AssetClass),
    };
  }

  @Get('types/:assetClass')
  getBrokerTypes(@Param('assetClass') assetClass: AssetClass) {
    return {
      message: 'Broker types retrieved successfully',
      data: BrokerFactory.getBrokersByAssetClass(assetClass),
    };
  }

  @Get('auth/:brokerType')
  getAuthUrl(@Param('brokerType') brokerType: BrokerType) {
    try {
      const authUrl = this.brokerAuthService.getAuthUrl(brokerType);
      return {
        message: 'Auth URL generated successfully',
        data: { authUrl },
      };
    } catch (error) {
      return {
        message: error.message,
        success: false,
      };
    }
  }

  @Get('connect/:brokerType')
  async initiateConnection(
    @Req() req: Request,
    @Param('brokerType') brokerType: BrokerType,
    @Res() res: Response,
  ) {
    try {
      const user = req.user as User;
      const authUrl = this.brokerAuthService.getAuthUrl(brokerType);

      // Store the broker type in session or use a state parameter
      // to retrieve it during callback

      return res.redirect(authUrl);
    } catch (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/broker-connected?success=false&error=${error.message}`,
      );
    }
  }

  @Get('oauth/callback')
  async oauthCallback(
    @Query('code') code: string,
    @Query('broker') brokerType: BrokerType,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user as User;
      const credentials = await this.brokerAuthService.handleOAuthCallback(
        brokerType,
        code,
        user._id,
      );

      // Connect the broker with the obtained credentials
      await this.brokersService.connectBroker(
        user._id,
        brokerType,
        credentials,
      );

      // Redirect to the frontend with success message
      return res.redirect(
        `${process.env.FRONTEND_URL}/broker-connected?success=true`,
      );
    } catch (error) {
      // Redirect to the frontend with error message
      return res.redirect(
        `${process.env.FRONTEND_URL}/broker-connected?success=false&error=${error.message}`,
      );
    }
  }

  @Post('connect')
  async connectBroker(
    @Req() req: Request,
    @Body() connectBrokerDto: ConnectBrokerDto,
  ) {
    const user = req.user as User;
    const response = await this.brokersService.connectBroker(
      user._id,
      connectBrokerDto.brokerType,
      connectBrokerDto.credentials,
    );

    return {
      success: response.success,
      message:
        response.message ||
        (response.success
          ? 'Broker connected successfully'
          : 'Failed to connect broker'),
      data: response.data,
    };
  }

  @Get('connections')
  async getBrokerConnections(@Req() req: Request) {
    const user = req.user as User;
    return {
      message: 'Broker connections retrieved successfully',
      data: await this.brokersService.getBrokerConnections(user._id),
    };
  }

  @Post('orders')
  async createOrder(
    @Req() req: Request,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const user = req.user as User;
    return {
      message: 'Order created successfully',
      data: await this.brokersService.createOrder(user._id, createOrderDto),
    };
  }

  @Get('orders')
  async getOrders(@Req() req: Request) {
    const user = req.user as User;
    return {
      message: 'Orders retrieved successfully',
      data: await this.ordersService.getOrdersByUser(user._id),
    };
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return {
      message: 'Order retrieved successfully',
      data: await this.ordersService.getOrderById(id),
    };
  }

  @Delete('orders/:id')
  async cancelOrder(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as User;
    const success = await this.brokersService.cancelOrder(user._id, id);

    return {
      message: success
        ? 'Order canceled successfully'
        : 'Failed to cancel order',
      success,
    };
  }

  @Get('supported-markets/:brokerType')
  getSupportedMarkets(@Param('brokerType') brokerType: BrokerType) {
    try {
      const supportedAssetClasses =
        BrokerFactory.getSupportedAssetClasses(brokerType);
      return {
        message: 'Supported markets retrieved successfully',
        data: supportedAssetClasses,
      };
    } catch (error) {
      return {
        message: 'Failed to get supported markets',
        error: error.message,
      };
    }
  }

  @Get('brokers-by-market/:assetClass')
  getBrokersByMarket(@Param('assetClass') assetClass: AssetClass) {
    try {
      const brokers = BrokerFactory.getBrokersByAssetClass(assetClass);
      return {
        message: 'Brokers retrieved successfully',
        data: brokers,
      };
    } catch (error) {
      return {
        message: 'Failed to get brokers by market',
        error: error.message,
      };
    }
  }
}
