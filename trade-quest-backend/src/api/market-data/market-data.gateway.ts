import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { MarketDataService } from './market-data.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend domain
  },
  namespace: 'market-data',
})
export class MarketDataGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MarketDataGateway.name);
  private readonly clientSubscriptions = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(private readonly marketDataService: MarketDataService) {}

  afterInit(server: Server) {
    this.logger.log('Market Data WebSocket Gateway initialized');
    this.marketDataService.setSocketServer(server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const symbols = this.clientSubscriptions.get(client.id);

    if (symbols) {
      // Unsubscribe from all symbols for this client
      symbols.forEach((symbol) => {
        this.marketDataService.unsubscribeFromSymbol(symbol, client.id);
      });
    }

    this.clientSubscriptions.delete(client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(
    client: Socket,
    payload: { symbols: string[] },
  ): WsResponse<any> {
    const { symbols } = payload;
    const clientSubs = this.clientSubscriptions.get(client.id);

    if (!clientSubs) {
      return { event: 'error', data: 'Client not initialized' };
    }

    symbols.forEach((symbol) => {
      clientSubs.add(symbol);
      this.marketDataService.subscribeToSymbol(symbol, client.id);
    });

    return { event: 'subscribed', data: { symbols } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    client: Socket,
    payload: { symbols: string[] },
  ): WsResponse<any> {
    const { symbols } = payload;
    const clientSubs = this.clientSubscriptions.get(client.id);

    if (!clientSubs) {
      return { event: 'error', data: 'Client not initialized' };
    }

    symbols.forEach((symbol) => {
      clientSubs.delete(symbol);
      this.marketDataService.unsubscribeFromSymbol(symbol, client.id);
    });

    return { event: 'unsubscribed', data: { symbols } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_snapshot')
  async handleGetSnapshot(
    client: Socket,
    payload: { symbol: string },
  ): Promise<WsResponse<any>> {
    const { symbol } = payload;

    try {
      const snapshot =
        await this.marketDataService.getMarketDataSnapshot(symbol);
      return { event: 'snapshot', data: { symbol, data: snapshot } };
    } catch (error) {
      return {
        event: 'error',
        data: `Failed to get snapshot for ${symbol}: ${error.message}`,
      };
    }
  }
}
