import { NotFoundException } from '@nestjs/common';

export class RaffleNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Raffle with ID ${id} not found`);
  }
}
