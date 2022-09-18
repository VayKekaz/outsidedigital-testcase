import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Tag, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, EditTagDto } from './tag.dtos';

type TagIncludedCreator = Tag & { creator: User };

@Injectable()
export class TagService {
  private readonly repository: Prisma.TagDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >;

  constructor(prisma: PrismaService) {
    this.repository = prisma.tag;
  }

  async isUidCreatorOfTagById(uid: string, tagId: number): Promise<Boolean> {
    const tag = await this.getById(tagId);
    return uid === tag.creatorId;
  }

  async getById(id: number): Promise<Tag> {
    const tag = await this.repository.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag(id=${id}) does not exist.`);
    return tag;
  }

  async getByIdIncludeCreator(id: number): Promise<TagIncludedCreator> {
    const tag = await this.repository.findUnique({
      where: { id },
      include: { creator: true },
    });
    if (!tag) throw new NotFoundException(`Tag(id=${id}) does not exist.`);
    return tag;
  }

  async getAllIncludeCreator(
    offset?: number,
    length?: number,
    sorting?: string,
  ): Promise<Array<TagIncludedCreator>> {
    const orderBy = this.sortingQueryToOrderByMap[sorting] || { id: 'asc' };
    return this.repository.findMany({
      skip: offset,
      take: length,
      orderBy,
      include: { creator: true },
    });
  }
  private readonly sortingQueryToOrderByMap = Object.freeze({
    name: { name: 'asc' },
    sortOrder: { sortOrder: 'asc' },
  });

  async getAllForUser(uid: string): Promise<Array<Tag>> {
    return this.repository.findMany({ where: { creatorId: uid } });
  }

  async getManyByName(...names: Array<string>): Promise<Array<Tag>> {
    return this.repository.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  }

  async createManyForUser(
    uid: string,
    ...dtos: Array<CreateTagDto>
  ): Promise<void> {
    await this.repository.createMany({
      data: dtos.map(dto => {
        return { ...dto, creatorId: uid };
      }),
    });
  }

  async createForUser(uid: string, dto: CreateTagDto): Promise<Tag> {
    return this.repository.create({
      data: {
        ...dto,
        creatorId: uid,
      },
    });
  }

  async editById(id: number, dto: EditTagDto): Promise<Tag> {
    const tag = await this.getById(id);
    if (!tag) throw new NotFoundException(`Tag with id ${id} not found.`);
    return this.repository.update({
      where: { id },
      data: dto,
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete({ where: { id } });
  }
}
