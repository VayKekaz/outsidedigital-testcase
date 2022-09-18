import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { UserCreationDto } from '../user/user.dtos';
import { UserService } from '../user/user.service';
import { AccessTokenDto, AuthDto, RegisterDto } from './security.dtos';

@Injectable()
export class SecurityService {
  /**
   * In-memory storage for one-time refresh tokens. TODO implement locking.
   */
  private refreshTokenStorage: Array<string> = [];
  private readonly ACCESS_TOKEN_PROPS: JwtSignOptions;
  private readonly REFRESH_TOKEN_PROPS: JwtSignOptions;

  constructor(
    private jwt: JwtService,
    config: ConfigService,
    private userService: UserService,
  ) {
    const secret = config.get('JWT_SECRET') || 'change-me';
    this.ACCESS_TOKEN_PROPS = Object.freeze({
      secret,
      expiresIn: config.get('ACCESS_TOKEN_LIFETIME') || '30m',
    });
    this.REFRESH_TOKEN_PROPS = Object.freeze({
      secret,
      expiresIn: config.get('REFRESH_TOKEN_LIFETIME') || '30d',
    });
  }

  async signup(registration: RegisterDto): Promise<AccessTokenDto> {
    try {
      const userCreationDto: UserCreationDto = {
        email: registration.email,
        nickname: registration.nickname,
        passwordHash: await this.hashPassword(registration.password),
      };
      const createdUser = await this.userService.create(userCreationDto);
      return await this.issueTokenPair(createdUser);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ForbiddenException('Nickname or email already exist.');
      throw error;
    }
  }

  async login(auth: AuthDto): Promise<AccessTokenDto> {
    let user: User;
    if (auth.email) {
      user = await this.userService.getByEmail(auth.email);
    } else if (auth.nickname) {
      user = await this.userService.getByNickname(auth.nickname);
    } else {
      throw new BadRequestException('Nickname or email must be provided.');
    }
    if (!user) throw new ForbiddenException('Credentials incorrect');
    this.verifyMatch(user, auth.password);
    return await this.issueTokenPair(user);
  }

  async refreshToken(token: string): Promise<AccessTokenDto> {
    const tokenIndex = this.refreshTokenStorage.indexOf(token);
    if (tokenIndex === -1)
      throw new UnauthorizedException('Refresh token is not valid');
    this.refreshTokenStorage.splice(tokenIndex, 1);
    const payload = this.jwt.decode(token, {
      ...this.REFRESH_TOKEN_PROPS,
      json: true,
    });
    const userId = payload['sub'];
    const user = await this.userService.getById(userId);
    return this.issueTokenPair(user);
  }

  private async hashPassword(pw: string): Promise<string> {
    return argon.hash(pw);
  }

  /**
   *
   * @param pw unhashed password to check.
   * @param user user from database with hashed password to check against.
   * @returns true if password matches, false otherwise.
   */
  private async userHashMatchesPassword(
    user: User,
    pw: string,
  ): Promise<boolean> {
    return argon.verify(user.passwordHash, pw);
  }

  /**
   * Throws if password does not match user.passwordHash. Does nothing otherwise.
   *
   * @param pw unhashed password to check.
   * @param user user from database with hashed password to check against.
   */
  private async verifyMatch(user: User, pw: string): Promise<void> {
    if (!this.userHashMatchesPassword(user, pw))
      throw new UnauthorizedException('Password does not match.');
  }

  private async issueTokenPair(user: User): Promise<AccessTokenDto> {
    const payload = {
      sub: user.uid,
      email: user.email,
    };
    const accessToken = await this.jwt.signAsync(
      { ...payload, type: 'access' },
      this.ACCESS_TOKEN_PROPS,
    );
    const refreshToken = await this.jwt.signAsync(
      { ...payload, type: 'refresh' },
      this.ACCESS_TOKEN_PROPS,
    );
    this.refreshTokenStorage.push(refreshToken);
    return {
      accessToken,
      //@ts-ignore
      expiresIn: this.ACCESS_TOKEN_PROPS.expiresIn,
      refreshToken,
    };
  }
}
