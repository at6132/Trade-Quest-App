import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
  ) {}

  async createSession(
    userId: string,
    token: string,
    deviceInfo: Session['deviceInfo'],
  ): Promise<Session> {
    const encryptedToken = await bcrypt.hash(token, 10);
    const decoded = this.jwtService.decode(token);
    const expiresAt = new Date((decoded as any).exp * 1000);

    return this.sessionModel.create({
      userId,
      token: encryptedToken,
      deviceInfo,
      lastActiveAt: new Date(),
      expiresAt,
    });
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ userId, isActive: true })
      .sort({ lastActiveAt: -1 })
      .exec();
  }

  async terminateSession(userId: string, sessionId: string): Promise<boolean> {
    const result = await this.sessionModel.updateOne(
      { _id: sessionId, userId },
      { isActive: false },
    );
    return result.modifiedCount > 0;
  }

  async terminateAllSessions(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    const query = { userId, isActive: true };
    if (exceptSessionId) {
      Object.assign(query, { _id: { $ne: exceptSessionId } });
    }
    await this.sessionModel.updateMany(query, { isActive: false });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: sessionId },
      { lastActiveAt: new Date() },
    );
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.sessionModel.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }
}
