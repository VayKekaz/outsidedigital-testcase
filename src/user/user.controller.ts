import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../security/security.decorators';
import { JwtGuard } from '../security/security.jwt';
import { EditUserDto, UserDto } from './user.dtos';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(200)
  @Get()
  async getMe(@GetUser('uid') uid: string): Promise<UserDto> {
    const user = await this.userService.getByIdIncludeTags(uid);
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
