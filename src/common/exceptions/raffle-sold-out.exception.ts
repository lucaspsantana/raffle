import { BadRequestException } from '@nestjs/common';

export class RaffleSoldOutException extends BadRequestException {
  constructor() {
    super('This raffle is sold out');
  }
}
