import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tag, User } from '@prisma/client';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDto } from '../user/user.dtos';

export type TagOptionalCreator = Tag & { creator?: User };
export type TagIncludedCreator = Tag & { creator: User };

export class TagDto {
  id: number;
  name: string;
  sortOrder: number = 0;
  creator?: UserDto;

  constructor(model: TagOptionalCreator, creator?: User) {
    this.id = model.id;
    this.name = model.name;
    this.sortOrder = model.sortOrder;
    if (creator) this.creator = new UserDto(creator);
    else if (model.creator) this.creator = new UserDto(model.creator);
  }
}

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: 0 })
  sortOrder?: number = 0;
}

export class EditTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  name: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: 0 })
  sortOrder?: number = 0;
}
