import { ConflictException } from '@nestjs/common';

export class DuplicateCpfException extends ConflictException {
  constructor() {
    super('CPF already registered');
  }
}
