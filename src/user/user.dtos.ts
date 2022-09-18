import { Tag, User } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { TagDto } from '../tag/tag.dtos';

export type UserWithTags = User & { tags: Array<Tag> };
export type UserOptionalTags = User & { tags?: Array<Tag> };

export class UserDto {
  uid: string;
  email: string;
  nickname: string;
  @Exclude() passwordHash?: String;
  tags: Array<TagDto> = [];

  // TODO
  constructor(model: UserOptionalTags, tags: Array<Tag> = []) {
    this.uid = model.uid;
    this.email = model.email;
    this.nickname = model.nickname;
    this.passwordHash = model.passwordHash;
    if (model.tags) this.tags = model.tags.map(tag => new TagDto(tag));
    else this.tags = tags.map(tag => new TagDto(tag));
  }
}

export class UserCreationDto {
  @IsEmail()
  email: string;

  @IsString()
  nickname: string;

  passwordHash: string;
}

export class EditUserDto {
  @IsOptional()
  uid?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}
