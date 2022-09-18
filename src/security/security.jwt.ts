import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly getUser: (uid: string) => Promise<User>;

  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
    this.getUser = (uid: string) =>
      this.prisma.user.findUnique({ where: { uid } });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.getUser(payload.sub);
    if (!user) throw new UnauthorizedException('User has been deleted.');
    delete user.passwordHash;
    return user;
  }
}
