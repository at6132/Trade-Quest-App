import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';
import axios from 'axios';
import * as WebSocket from 'ws';

@Injectable()
export class MarketDataService implements OnModuleDestroy {
  private readonly logger = new Logger(MarketDataService.name);
  private socketServer: Server;
  private barchartWs: WebSocket;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout;

  // Track active subscriptions: symbol -> Set of client IDs
  private activeSubscriptions = new Map<string, Set<string>>();

  constructor(private readonly configService: ConfigService) {}

  //   onModuleInit() {
  //     this.connectToBarchart();
  //   }

  onModuleDestroy() {
    this.disconnect();
  }

  setSocketServer(server: Server) {
    this.socketServer = server;
  }

  private connectToBarchart() {
    const apiKey = this.configService.get<string>('BARCHART_API_KEY');
    const wsUrl = this.configService.get<string>('BARCHART_WS_URL');

    if (!apiKey || !wsUrl) {
      this.logger.error('Barchart API key or WebSocket URL not configured');
      return;
    }

    this.logger.log('Connecting to Barchart WebSocket...');

    this.barchartWs = new WebSocket(`${wsUrl}?apikey=${apiKey}`);

    this.barchartWs.on('open', () => {
      this.logger.log('Connected to Barchart WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Resubscribe to all active symbols
      this.resubscribeAll();
    });

    this.barchartWs.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleBarchartMessage(message);
      } catch (error) {
        this.logger.error(`Error parsing Barchart message: ${error.message}`);
      }
    });

    this.barchartWs.on('error', (error) => {
      this.logger.error(`Barchart WebSocket error: ${error.message}`);
    });

    this.barchartWs.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Barchart WebSocket connection closed');
      this.attemptReconnect();
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`,
      );
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.logger.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connectToBarchart();
    }, delay);
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.barchartWs) {
      this.barchartWs.terminate();
    }
  }

  private resubscribeAll() {
    if (!this.isConnected) return;

    for (const symbol of this.activeSubscriptions.keys()) {
      this.subscribeToBarchartSymbol(symbol);
    }
  }

  private handleBarchartMessage(message: any) {
    // Handle different message types from Barchart
    if (message.type === 'QUOTE' || message.type === 'TRADE') {
      const { symbol, data } = message;

      if (symbol && this.activeSubscriptions.has(symbol)) {
        // Broadcast to all clients subscribed to this symbol
        this.broadcastUpdate(symbol, data);
      }
    }
  }

  private broadcastUpdate(symbol: string, data: any) {
    const clients = this.activeSubscriptions.get(symbol);

    if (!clients || clients.size === 0) return;

    // Format the data for clients
    const formattedData = this.formatMarketData(data);

    // Send to each subscribed client
    for (const clientId of clients) {
      this.socketServer.to(clientId).emit('market_update', {
        symbol,
        data: formattedData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private formatMarketData(data: any) {
    // Transform Barchart data format to our application format
    return {
      price: data.lastPrice || data.price,
      change: data.netChange,
      percentChange: data.percentChange,
      volume: data.volume,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose,
      // Add other fields as needed
    };
  }

  subscribeToSymbol(symbol: string, clientId: string) {
    if (!this.activeSubscriptions.has(symbol)) {
      this.activeSubscriptions.set(symbol, new Set([clientId]));

      // Subscribe to Barchart if we're connected
      if (this.isConnected) {
        this.subscribeToBarchartSymbol(symbol);
      }
    } else {
      const clients = this.activeSubscriptions.get(symbol);
      if (clients) {
        clients.add(clientId);
      }
    }
  }

  unsubscribeFromSymbol(symbol: string, clientId: string) {
    const clients = this.activeSubscriptions.get(symbol);

    if (!clients) return;

    clients.delete(clientId);

    // If no more clients are subscribed, unsubscribe from Barchart
    if (clients.size === 0) {
      this.activeSubscriptions.delete(symbol);

      if (this.isConnected) {
        this.unsubscribeFromBarchartSymbol(symbol);
      }
    }
  }

  private subscribeToBarchartSymbol(symbol: string) {
    if (!this.isConnected) return;

    this.barchartWs.send(
      JSON.stringify({
        type: 'SUBSCRIBE',
        symbol,
        fields: ['TRADE', 'QUOTE'],
      }),
    );
  }

  private unsubscribeFromBarchartSymbol(symbol: string) {
    if (!this.isConnected) return;

    this.barchartWs.send(
      JSON.stringify({
        type: 'UNSUBSCRIBE',
        symbol,
      }),
    );
  }

  async getMarketDataSnapshot(symbol: string): Promise<any> {
    const apiKey = this.configService.get<string>('BARCHART_API_KEY');
    const apiUrl = this.configService.get<string>('BARCHART_API_URL');

    try {
      const response = await axios.get(`${apiUrl}/getQuote.json`, {
        params: {
          apikey: apiKey,
          symbols: symbol,
          fields:
            'fiftyTwoWkHigh,fiftyTwoWkLow,dividendYield,dividendRate,peRatio,pbRatio,marketCap,volume,averageVolume',
        },
      });

      if (
        response.data &&
        response.data.status &&
        response.data.status.code === 200
      ) {
        return this.formatMarketDataSnapshot(response.data.results[0]);
      } else {
        throw new Error(
          `API returned error: ${response.data?.status?.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error fetching market data snapshot: ${error.message}`,
      );
      throw error;
    }
  }

  private formatMarketDataSnapshot(data: any) {
    return {
      symbol: data.symbol,
      name: data.name,
      price: data.lastPrice,
      change: data.netChange,
      percentChange: data.percentChange,
      volume: data.volume,
      averageVolume: data.averageVolume,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.previousClose,
      marketCap: data.marketCap,
      peRatio: data.peRatio,
      pbRatio: data.pbRatio,
      dividendYield: data.dividendYield,
      dividendRate: data.dividendRate,
      fiftyTwoWeekHigh: data.fiftyTwoWkHigh,
      fiftyTwoWeekLow: data.fiftyTwoWkLow,
      timestamp: new Date().toISOString(),
    };
  }
}
