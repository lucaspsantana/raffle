import { BadRequestException } from '@nestjs/common';

export class RaffleClosedException extends BadRequestException {
  constructor() {
    super('This raffle is already closed');
  }
}
