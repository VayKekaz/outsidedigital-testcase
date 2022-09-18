import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../security/security.decorators';
import { JwtGuard } from '../security/security.jwt';
import { EditUserDto, UserDto } from './user.dtos';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(200)
  @Get()
  getMe(@GetUser() user: User): UserDto {
    return new UserDto(user);
  }

  @HttpCode(200)
  @Put()
  async editUser(
    @GetUser('uid') uid: string,
    @Body() dto: EditUserDto,
  ): Promise<UserDto> {
    return new UserDto(await this.userService.edit(uid, dto));
  }

  @HttpCode(204)
  @Delete()
  async deleteSelfUser(@GetUser('uid') uid: string): Promise<void> {
    this.userService.deleteById(uid);
  }
}
