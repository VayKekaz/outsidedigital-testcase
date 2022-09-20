import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DefaultValuePipe } from '@nestjs/common/pipes';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Page } from '../pagination';
import { GetUser } from '../security/security.decorators';
import { JwtGuard } from '../security/security.jwt';
import { CreateTagDto, EditTagDto, TagDto } from './tag.dtos';
import { TagService } from './tag.service';

@Controller('tags')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  @HttpCode(200)
  @ApiQuery({
    name: 'offset',
    required: false,
    schema: { default: 0, minimum: 0 },
  })
  @ApiQuery({
    name: 'length',
    required: false,
    schema: { default: 0, minimum: 1 },
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    schema: { default: 'sortOrder', enum: ['sortOrder', 'name'] },
  })
  async getPaginated(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('length', new DefaultValuePipe(10), ParseIntPipe) length?: number,
    @Query('sortBy', new DefaultValuePipe('sortOrder')) sort?: string,
  ): Promise<Page<TagDto>> {
    const tags = await this.tagService.getAllIncludeCreator(
      offset,
      length,
      sort,
    );
    return new Page(
      tags.map(tag => new TagDto(tag)),
      offset,
      length,
    );
  }

  @HttpCode(200)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<TagDto> {
    return new TagDto(await this.tagService.getByIdIncludeCreator(id));
  }

  @HttpCode(201)
  @Post()
  async create(
    @GetUser('uid') uid: string,
    @Body() dto: CreateTagDto,
  ): Promise<TagDto> {
    return new TagDto(await this.tagService.createForUser(uid, dto));
  }

  @HttpCode(201)
  @Post('/multiple')
  @ApiBody({ type: [CreateTagDto] })
  async createMultiple(
    @GetUser('uid') uid: string,
    @Body() dto: Array<CreateTagDto>,
  ): Promise<Array<TagDto>> {
    await this.tagService.createManyForUser(uid, ...dto);
    return (await this.tagService.getManyByName(...dto.map(it => it.name))).map(
      tag => new TagDto(tag),
    );
  }

  @HttpCode(200)
  @Put(':id')
  async editById(
    @GetUser('uid') uid: string,
    @Param('id', ParseIntPipe) tagId: number,
    @Body() dto: EditTagDto,
  ): Promise<TagDto> {
    if (!(await this.tagService.isUidCreatorOfTagById(uid, tagId)))
      throw new ForbiddenException(`You don't own Tag(id=${tagId})`);
    return new TagDto(await this.tagService.editById(tagId, dto));
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteById(
    @GetUser('uid') uid: string,
    @Param('id', ParseIntPipe) tagId: number,
  ): Promise<void> {
    if (!(await this.tagService.isUidCreatorOfTagById(uid, tagId)))
      throw new ForbiddenException(`You don't own Tag(id=${tagId})`);
    this.tagService.deleteById(tagId);
  }
}
