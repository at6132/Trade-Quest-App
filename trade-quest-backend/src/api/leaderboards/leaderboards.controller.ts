import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { Leaderboard } from './schemas/leaderboard.schema';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Post()
  create(@Body() leaderboard: Partial<Leaderboard>) {
    return this.leaderboardsService.create(leaderboard);
  }

  @Get()
  findAll() {
    return this.leaderboardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() leaderboard: Partial<Leaderboard>) {
    return this.leaderboardsService.update(id, leaderboard);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaderboardsService.remove(id);
  }
}
