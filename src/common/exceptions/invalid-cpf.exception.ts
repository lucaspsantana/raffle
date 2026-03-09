import { BadRequestException } from '@nestjs/common';

export class InvalidCpfException extends BadRequestException {
  constructor() {
    super('Invalid CPF format');
  }
}
