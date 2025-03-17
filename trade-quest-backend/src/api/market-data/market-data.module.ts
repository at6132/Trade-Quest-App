import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketDataGateway } from './market-data.gateway';
import { MarketDataService } from './market-data.service';

@Module({
  imports: [ConfigModule],
  providers: [MarketDataGateway, MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}
