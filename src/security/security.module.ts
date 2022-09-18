import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SecurityService } from './security.service';
import { AuthController as SecurityController } from './security.controller';
import { JwtStrategy } from './security.jwt';

@Module({
  imports: [JwtModule.register({}), UserModule],
  controllers: [SecurityController],
  providers: [SecurityService, JwtStrategy],
})
export class SecurityModule {}
