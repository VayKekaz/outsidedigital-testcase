import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class Page<T> {
  data: Array<T>;
  meta: {
    offset: number;
    length: number;
    quantity: number;
  };

  constructor(data: Array<T> = [], offset: number = 0, length: number = 10) {
    this.data = data;
    this.meta = {
      offset,
      length,
      quantity: data.length,
    };
  }
}

export const Pagination = createParamDecorator(request => {
  const pagination = {
    offset: request.params['offset'],
    length: request.params['length'],
  };
  console.log('PAGINATION = ' + JSON.stringify(pagination));
});
