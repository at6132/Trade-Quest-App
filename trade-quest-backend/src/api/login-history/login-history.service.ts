import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginHistory, LoginHistoryDocument } from './schemas/login-history.schema';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectModel(LoginHistory.name)
    private loginHistoryModel: Model<LoginHistoryDocument>,
  ) {}

  async create(createLoginHistoryDto: CreateLoginHistoryDto): Promise<LoginHistory> {
    const loginHistory = new this.loginHistoryModel(createLoginHistoryDto);
    return loginHistory.save();
  }
} 