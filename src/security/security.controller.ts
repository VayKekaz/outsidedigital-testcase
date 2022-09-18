import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AccessTokenDto, AuthDto, RegisterDto } from './security.dtos';
import { SecurityService } from './security.service';

@Controller()
export class AuthController {
  constructor(private authService: SecurityService) {}

  @HttpCode(201)
  @Post('signup')
  async signup(@Body() dto: RegisterDto): Promise<AccessTokenDto> {
    return await this.authService.signup(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: AuthDto): Promise<AccessTokenDto> {
    return await this.authService.login(dto);
  }

  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AccessTokenDto> {
    return this.authService.refreshToken(refreshToken);
  }
}
