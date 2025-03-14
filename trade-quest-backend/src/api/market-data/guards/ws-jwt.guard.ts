import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify(token);
      // Attach user to socket
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!auth) {
      return undefined;
    }

    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
