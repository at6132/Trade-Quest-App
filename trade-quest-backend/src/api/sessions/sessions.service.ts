import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  private session_secret: string;
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.session_secret = this.configService.get('SESSION_SECRET') || 'secret';
  }

  // wnat to encrypt using crypto then want to decrpt that tokn for use

  encryptToken(token: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.session_secret,
      'iv',
    );
    const encrypted = cipher.update(token, 'utf8', 'hex');
    return encrypted + cipher.final('hex');
  }

  decryptToken(token: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.session_secret,
      'iv',
    );
    const decrypted = decipher.update(token, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
  }

  async createSession(
    userId: string,
    token: string,
    deviceInfo: Session['deviceInfo'],
  ): Promise<Session> {
    const encryptedToken = this.encryptToken(token);
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
    const decryptedToken = this.decryptToken(token);
    return this.sessionModel.findOne({
      token: decryptedToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }
}
