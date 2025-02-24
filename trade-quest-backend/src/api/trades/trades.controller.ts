import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { Trade } from './schemas/trade.schema';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body() trade: Partial<Trade>) {
    return this.tradesService.create(trade);
  }

  @Get()
  findAll() {
    return this.tradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() trade: Partial<Trade>) {
    return this.tradesService.update(id, trade);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradesService.remove(id);
  }
}
