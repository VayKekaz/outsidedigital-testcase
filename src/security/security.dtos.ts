import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty()
  nickname: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class AuthDto {
  @ValidateIf(it => it.email == null)
  @IsNotEmpty()
  @ApiPropertyOptional()
  nickname?: string;

  @ValidateIf(it => it.nickname == null)
  @IsNotEmpty()
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
