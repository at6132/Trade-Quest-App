import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async createSession(
    userId: string,
    expiresAt: Date,
    deviceInfo: Session['deviceInfo'],
  ): Promise<Session> {
    return this.sessionModel.create({
      userId,
      deviceInfo,
      lastActiveAt: new Date(),
      expiresAt,
    });
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ userId, isActive: true, expiresAt: { $gt: new Date() } })
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
    const query: any = {
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    };

    if (exceptSessionId) {
      query._id = { $ne: exceptSessionId };
    }

    await this.sessionModel.updateMany(query, {
      isActive: false,
      lastActiveAt: new Date(),
    });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: sessionId },
      { lastActiveAt: new Date() },
    );
  }

  async findBySessionId(sessionId: string): Promise<Session | null> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    return session;
  }
}
