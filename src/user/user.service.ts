import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto, UserCreationDto } from './user.dtos';

@Injectable()
export class UserService {
  private readonly repository: Prisma.UserDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(prisma: PrismaService) {
    this.repository = prisma.user;
  }

  getAll(): Promise<Array<User>> {
    return this.repository.findMany();
  }

  async create(user: UserCreationDto): Promise<User> {
    return this.repository.create({ data: user });
  }

  async getById(uid: string): Promise<User> {
    return this.repository.findUnique({ where: { uid } });
  }

  async getByEmail(email: string): Promise<User> {
    return this.repository.findUnique({ where: { email } });
  }

  async getByNickname(nickname: string): Promise<User> {
    return this.repository.findUnique({ where: { nickname } });
  }

  async edit(uid: string, dto: EditUserDto): Promise<User> {
    return this.repository.update({
      where: { uid },
      data: dto,
    });
  }

  async deleteById(uid: string): Promise<void> {
    await this.repository.delete({ where: { uid } });
  }
}
