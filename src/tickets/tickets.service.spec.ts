import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    raffle: {
      findUnique: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUniqueTicketNumber', () => {
    it('should generate a unique ticket number on first attempt', async () => {
      const raffleId = 'raffle-1';
      const raffle = {
        id: raffleId,
        maxTickets: 100,
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const result = await service.generateUniqueTicketNumber(raffleId);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
      expect(prisma.raffle.findUnique).toHaveBeenCalledWith({
        where: { id: raffleId },
        select: { maxTickets: true },
      });
    });

    it('should retry when first number is taken', async () => {
      const raffleId = 'raffle-1';
      const raffle = {
        id: raffleId,
        maxTickets: 100,
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.ticket.findUnique
        .mockResolvedValueOnce({ id: 'ticket-1' }) // First attempt: taken
        .mockResolvedValueOnce(null); // Second attempt: available

      const result = await service.generateUniqueTicketNumber(raffleId);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
      expect(prisma.ticket.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(
        service.generateUniqueTicketNumber(raffleId),
      ).rejects.toThrow(new NotFoundException('Raffle not found'));
    });

    it('should throw error after maximum attempts', async () => {
      const raffleId = 'raffle-1';
      const raffle = {
        id: raffleId,
        maxTickets: 100,
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      // All attempts return taken
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 'ticket-1' });

      await expect(
        service.generateUniqueTicketNumber(raffleId),
      ).rejects.toThrow('Unable to generate unique ticket number after maximum attempts');

      expect(prisma.ticket.findUnique).toHaveBeenCalledTimes(10);
    });
  });

  describe('isNumberTaken', () => {
    it('should return true when number is taken', async () => {
      const raffleId = 'raffle-1';
      const number = 42;

      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        number,
        raffleId,
      });

      const result = await service.isNumberTaken(raffleId, number);

      expect(result).toBe(true);
      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: {
          raffleId_number: {
            raffleId,
            number,
          },
        },
      });
    });

    it('should return false when number is available', async () => {
      const raffleId = 'raffle-1';
      const number = 42;

      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const result = await service.isNumberTaken(raffleId, number);

      expect(result).toBe(false);
    });
  });

  describe('purchase', () => {
    it('should purchase a ticket successfully', async () => {
      const userId = 'user-1';
      const raffleId = 'raffle-1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        closingDate: futureDate,
        maxTickets: 100,
        _count: {
          tickets: 50,
        },
      };

      const createdTicket = {
        id: 'ticket-1',
        number: 42,
        raffleId,
        userId,
        purchaseDate: new Date(),
      };

      // Mock the transaction
      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        const tx = {
          raffle: {
            findUnique: jest.fn().mockResolvedValue(raffle),
          },
          ticket: {
            create: jest.fn().mockResolvedValue(createdTicket),
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      // Mock for generateUniqueTicketNumber
      mockPrismaService.raffle.findUnique.mockResolvedValue({
        id: raffleId,
        maxTickets: 100,
      });
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      const result = await service.purchase(userId, raffleId);

      expect(result).toEqual(createdTicket);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const userId = 'user-1';
      const raffleId = 'non-existent';

      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        const tx = {
          raffle: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      await expect(service.purchase(userId, raffleId)).rejects.toThrow(
        new NotFoundException('Raffle not found'),
      );
    });

    it('should throw BadRequestException when raffle is closed', async () => {
      const userId = 'user-1';
      const raffleId = 'raffle-1';
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        closingDate: pastDate,
        maxTickets: 100,
        _count: {
          tickets: 50,
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        const tx = {
          raffle: {
            findUnique: jest.fn().mockResolvedValue(raffle),
          },
        };
        return callback(tx);
      });

      await expect(service.purchase(userId, raffleId)).rejects.toThrow(
        new BadRequestException('This raffle is already closed'),
      );
    });

    it('should throw BadRequestException when raffle is sold out', async () => {
      const userId = 'user-1';
      const raffleId = 'raffle-1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        closingDate: futureDate,
        maxTickets: 100,
        _count: {
          tickets: 100, // Sold out
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback, options) => {
        const tx = {
          raffle: {
            findUnique: jest.fn().mockResolvedValue(raffle),
          },
        };
        return callback(tx);
      });

      await expect(service.purchase(userId, raffleId)).rejects.toThrow(
        new BadRequestException('This raffle is sold out'),
      );
    });
  });

  describe('findByUser', () => {
    it('should return all tickets for a user', async () => {
      const userId = 'user-1';
      const tickets = [
        {
          id: 'ticket-1',
          number: 42,
          raffleId: 'raffle-1',
          userId,
          purchaseDate: new Date(),
          raffle: {
            id: 'raffle-1',
            title: 'Test Raffle',
          },
        },
        {
          id: 'ticket-2',
          number: 43,
          raffleId: 'raffle-1',
          userId,
          purchaseDate: new Date(),
          raffle: {
            id: 'raffle-1',
            title: 'Test Raffle',
          },
        },
      ];

      mockPrismaService.ticket.findMany.mockResolvedValue(tickets);

      const result = await service.findByUser(userId);

      expect(result).toEqual(tickets);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          raffle: true,
        },
        orderBy: { purchaseDate: 'desc' },
      });
    });

    it('should return empty array when user has no tickets', async () => {
      const userId = 'user-1';

      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.findByUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findByRaffle', () => {
    it('should return all tickets for a raffle', async () => {
      const raffleId = 'raffle-1';
      const tickets = [
        {
          id: 'ticket-1',
          number: 1,
          raffleId,
          userId: 'user-1',
          purchaseDate: new Date(),
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '12345678901',
          },
        },
        {
          id: 'ticket-2',
          number: 2,
          raffleId,
          userId: 'user-2',
          purchaseDate: new Date(),
          user: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            cpf: '98765432109',
          },
        },
      ];

      mockPrismaService.ticket.findMany.mockResolvedValue(tickets);

      const result = await service.findByRaffle(raffleId);

      expect(result).toEqual(tickets);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { raffleId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
            },
          },
        },
        orderBy: { number: 'asc' },
      });
    });

    it('should return empty array when raffle has no tickets', async () => {
      const raffleId = 'raffle-1';

      mockPrismaService.ticket.findMany.mockResolvedValue([]);

      const result = await service.findByRaffle(raffleId);

      expect(result).toEqual([]);
    });
  });
});
