import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PortfolioProfile } from './interfaces/portfolio-profile.interface';
import { Portfolio } from './schemas/portfolio.schema';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  create(
    @Body('userId') userId: string,
    @Body() portfolio: Partial<Portfolio>,
  ): Promise<PortfolioProfile> {
    return this.portfoliosService.create(userId, portfolio);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string): Promise<PortfolioProfile[]> {
    return this.portfoliosService.findAll(userId);
  }

  @Get(':userId/:id')
  findOne(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<PortfolioProfile> {
    return this.portfoliosService.findOne(userId, id);
  }

  @Put(':userId/:id')
  update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() updates: Partial<Portfolio>,
  ): Promise<PortfolioProfile> {
    return this.portfoliosService.update(userId, id, updates);
  }

  @Delete(':userId/:id')
  remove(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.portfoliosService.remove(userId, id);
  }
}
