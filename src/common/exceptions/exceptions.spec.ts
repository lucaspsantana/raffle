import { HttpStatus } from '@nestjs/common';
import {
  RaffleNotFoundException,
  RaffleClosedException,
  RaffleSoldOutException,
  DuplicateCpfException,
  InvalidCpfException,
} from './index';

describe('Custom Exceptions', () => {
  describe('RaffleNotFoundException', () => {
    it('should create exception with correct message and status', () => {
      const raffleId = '123';
      const exception = new RaffleNotFoundException(raffleId);
      
      expect(exception.message).toBe(`Raffle with ID ${raffleId} not found`);
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('RaffleClosedException', () => {
    it('should create exception with correct message and status', () => {
      const exception = new RaffleClosedException();
      
      expect(exception.message).toBe('This raffle is already closed');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('RaffleSoldOutException', () => {
    it('should create exception with correct message and status', () => {
      const exception = new RaffleSoldOutException();
      
      expect(exception.message).toBe('This raffle is sold out');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DuplicateCpfException', () => {
    it('should create exception with correct message and status', () => {
      const exception = new DuplicateCpfException();
      
      expect(exception.message).toBe('CPF already registered');
      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('InvalidCpfException', () => {
    it('should create exception with correct message and status', () => {
      const exception = new InvalidCpfException();
      
      expect(exception.message).toBe('Invalid CPF format');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
