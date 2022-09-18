import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export interface AccessTokenDto {
  accessToken: string;
  expiresIn: string;
  refreshToken: string;
}

export interface JwtPayloadDto {
  type: 'access' | 'refresh';
  sub: string;
  email: string;
}

export class RegisterDto {
  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthDto {
  @ValidateIf(it => it.email == null)
  @IsNotEmpty()
  nickname?: string;

  @ValidateIf(it => it.nickname == null)
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
