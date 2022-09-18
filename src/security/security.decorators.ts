import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (field) {
      const userField = request.user[field];
      if (!userField) throw TypeError(`User does not have field "${field}"`);
      return userField;
    }
    return request.user;
  },
);
