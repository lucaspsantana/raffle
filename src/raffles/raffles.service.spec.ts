import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

describe('RafflesService', () => {
  let service: RafflesService;
  let prisma: PrismaService;
  let uploadsService: UploadsService;

  const mockPrismaService = {
    raffle: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUploadsService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RafflesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<RafflesService>(RafflesService);
    prisma = module.get<PrismaService>(PrismaService);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new raffle successfully', async () => {
      const createRaffleDto: CreateRaffleDto = {
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: '2025-12-31T23:59:59Z',
        ticketPrice: 10.5,
        maxTickets: 100,
        imageUrl: 'http://example.com/image.jpg',
      };

      const createdRaffle = {
        id: '1',
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: new Date('2025-12-31T23:59:59Z'),
        ticketPrice: 10.5 as any,
        maxTickets: 100,
        imageUrl: 'http://example.com/image.jpg',
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.create.mockResolvedValue(createdRaffle);

      const result = await service.create(createRaffleDto);

      expect(result).toEqual(createdRaffle);
      expect(prisma.raffle.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Raffle',
          description: 'Test Description',
          closingDate: new Date('2025-12-31T23:59:59Z'),
          ticketPrice: 10.5,
          maxTickets: 100,
          imageUrl: 'http://example.com/image.jpg',
        },
      });
    });

    it('should create a raffle without imageUrl', async () => {
      const createRaffleDto: CreateRaffleDto = {
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: '2025-12-31T23:59:59Z',
        ticketPrice: 10.5,
        maxTickets: 100,
      };

      const createdRaffle = {
        id: '1',
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: new Date('2025-12-31T23:59:59Z'),
        ticketPrice: 10.5 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.create.mockResolvedValue(createdRaffle);

      const result = await service.create(createRaffleDto);

      expect(result).toEqual(createdRaffle);
    });
  });

  describe('update', () => {
    it('should update a raffle successfully', async () => {
      const raffleId = '1';
      const updateRaffleDto: UpdateRaffleDto = {
        title: 'Updated Raffle',
        ticketPrice: 15.0,
      };

      const existingRaffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: new Date('2025-12-31T23:59:59Z'),
        ticketPrice: 10.5 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRaffle = {
        ...existingRaffle,
        title: 'Updated Raffle',
        ticketPrice: 15.0 as any,
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(existingRaffle);
      mockPrismaService.raffle.update.mockResolvedValue(updatedRaffle);

      const result = await service.update(raffleId, updateRaffleDto);

      expect(result).toEqual(updatedRaffle);
      expect(prisma.raffle.update).toHaveBeenCalledWith({
        where: { id: raffleId },
        data: {
          title: 'Updated Raffle',
          ticketPrice: 15.0,
        },
      });
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';
      const updateRaffleDto: UpdateRaffleDto = {
        title: 'Updated Raffle',
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(service.update(raffleId, updateRaffleDto)).rejects.toThrow(
        new NotFoundException(`Raffle with ID ${raffleId} not found`),
      );
    });
  });

  describe('findAll', () => {
    it('should return all raffles ordered by closing date', async () => {
      const raffles = [
        {
          id: '1',
          title: 'Raffle 1',
          description: 'Description 1',
          closingDate: new Date('2025-01-01'),
          ticketPrice: 10 as any,
          maxTickets: 100,
          imageUrl: null,
          winnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Raffle 2',
          description: 'Description 2',
          closingDate: new Date('2025-02-01'),
          ticketPrice: 20 as any,
          maxTickets: 200,
          imageUrl: null,
          winnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.raffle.findMany.mockResolvedValue(raffles);

      const result = await service.findAll();

      expect(result).toEqual(raffles);
      expect(prisma.raffle.findMany).toHaveBeenCalledWith({
        orderBy: { closingDate: 'asc' },
      });
    });

    it('should return empty array when no raffles exist', async () => {
      mockPrismaService.raffle.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('should return only active raffles', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const activeRaffles = [
        {
          id: '1',
          title: 'Active Raffle',
          description: 'Description',
          closingDate: futureDate,
          ticketPrice: 10 as any,
          maxTickets: 100,
          imageUrl: null,
          winnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.raffle.findMany.mockResolvedValue(activeRaffles);

      const result = await service.findActive();

      expect(result).toEqual(activeRaffles);
      expect(prisma.raffle.findMany).toHaveBeenCalledWith({
        where: {
          closingDate: {
            gt: expect.any(Date),
          },
        },
        orderBy: { closingDate: 'asc' },
      });
    });
  });

  describe('findWithWinners', () => {
    it('should return only closed raffles with winners', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const rafflesWithWinners = [
        {
          id: '1',
          title: 'Closed Raffle',
          description: 'Description',
          closingDate: pastDate,
          ticketPrice: 10 as any,
          maxTickets: 100,
          imageUrl: null,
          winnerId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.raffle.findMany.mockResolvedValue(rafflesWithWinners);

      const result = await service.findWithWinners();

      expect(result).toEqual(rafflesWithWinners);
      expect(prisma.raffle.findMany).toHaveBeenCalledWith({
        where: {
          closingDate: {
            lt: expect.any(Date),
          },
          winnerId: {
            not: null,
          },
        },
        orderBy: { closingDate: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return raffle when it exists', async () => {
      const raffle = {
        id: '1',
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);

      const result = await service.findById('1');

      expect(result).toEqual(raffle);
      expect(prisma.raffle.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when raffle does not exist', async () => {
      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a raffle successfully without image', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.raffle.delete.mockResolvedValue(raffle);

      await service.delete(raffleId);

      expect(prisma.raffle.delete).toHaveBeenCalledWith({
        where: { id: raffleId },
      });
      expect(uploadsService.deleteFile).not.toHaveBeenCalled();
    });

    it('should delete a raffle and its image when imageUrl exists', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: 'http://localhost:3000/uploads/raffle-123456.jpg',
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.raffle.delete.mockResolvedValue(raffle);
      mockUploadsService.deleteFile.mockResolvedValue(undefined);

      await service.delete(raffleId);

      expect(uploadsService.deleteFile).toHaveBeenCalledWith('raffle-123456.jpg');
      expect(prisma.raffle.delete).toHaveBeenCalledWith({
        where: { id: raffleId },
      });
    });

    it('should delete a raffle with simple filename imageUrl', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: 'raffle-123456.jpg',
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.raffle.delete.mockResolvedValue(raffle);
      mockUploadsService.deleteFile.mockResolvedValue(undefined);

      await service.delete(raffleId);

      expect(uploadsService.deleteFile).toHaveBeenCalledWith('raffle-123456.jpg');
      expect(prisma.raffle.delete).toHaveBeenCalledWith({
        where: { id: raffleId },
      });
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(service.delete(raffleId)).rejects.toThrow(
        new NotFoundException(`Raffle with ID ${raffleId} not found`),
      );
      expect(uploadsService.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('setWinner', () => {
    it('should set winner for a raffle successfully', async () => {
      const raffleId = '1';
      const winnerId = 'user-1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRaffle = {
        ...raffle,
        winnerId,
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);
      mockPrismaService.raffle.update.mockResolvedValue(updatedRaffle);

      const result = await service.setWinner(raffleId, winnerId);

      expect(result).toEqual(updatedRaffle);
      expect(prisma.raffle.update).toHaveBeenCalledWith({
        where: { id: raffleId },
        data: { winnerId },
      });
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';
      const winnerId = 'user-1';

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(service.setWinner(raffleId, winnerId)).rejects.toThrow(
        new NotFoundException(`Raffle with ID ${raffleId} not found`),
      );
    });
  });

  describe('isActive', () => {
    it('should return true for active raffle', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const raffle = {
        id: '1',
        title: 'Test Raffle',
        description: 'Description',
        closingDate: futureDate,
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.isActive(raffle)).toBe(true);
    });

    it('should return false for closed raffle', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const raffle = {
        id: '1',
        title: 'Test Raffle',
        description: 'Description',
        closingDate: pastDate,
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.isActive(raffle)).toBe(false);
    });
  });

  describe('hasAvailableTickets', () => {
    it('should return true when tickets are available', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          tickets: 50,
        },
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);

      const result = await service.hasAvailableTickets(raffleId);

      expect(result).toBe(true);
    });

    it('should return false when raffle is sold out', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          tickets: 100,
        },
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);

      const result = await service.hasAvailableTickets(raffleId);

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(service.hasAvailableTickets(raffleId)).rejects.toThrow(
        new NotFoundException(`Raffle with ID ${raffleId} not found`),
      );
    });
  });

  describe('getAvailableTicketsCount', () => {
    it('should return correct count of available tickets', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          tickets: 30,
        },
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);

      const result = await service.getAvailableTicketsCount(raffleId);

      expect(result).toBe(70);
    });

    it('should return 0 when raffle is sold out', async () => {
      const raffleId = '1';
      const raffle = {
        id: raffleId,
        title: 'Test Raffle',
        description: 'Description',
        closingDate: new Date('2025-12-31'),
        ticketPrice: 10 as any,
        maxTickets: 100,
        imageUrl: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          tickets: 100,
        },
      };

      mockPrismaService.raffle.findUnique.mockResolvedValue(raffle);

      const result = await service.getAvailableTicketsCount(raffleId);

      expect(result).toBe(0);
    });

    it('should throw NotFoundException when raffle does not exist', async () => {
      const raffleId = 'non-existent';

      mockPrismaService.raffle.findUnique.mockResolvedValue(null);

      await expect(service.getAvailableTicketsCount(raffleId)).rejects.toThrow(
        new NotFoundException(`Raffle with ID ${raffleId} not found`),
      );
    });
  });
});
