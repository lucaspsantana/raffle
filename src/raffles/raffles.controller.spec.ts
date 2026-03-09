import { Test, TestingModule } from '@nestjs/testing';
import { RafflesController } from './raffles.controller';
import { RafflesService } from './raffles.service';
import { UserRole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('RafflesController', () => {
  let controller: RafflesController;
  let service: RafflesService;

  const mockRafflesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findWithWinners: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setWinner: jest.fn(),
  };

  const mockRaffle = {
    id: '1',
    title: 'Test Raffle',
    description: 'Test Description',
    closingDate: new Date('2025-12-31'),
    ticketPrice: 10,
    maxTickets: 100,
    imageUrl: 'test.jpg',
    winnerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RafflesController],
      providers: [
        {
          provide: RafflesService,
          useValue: mockRafflesService,
        },
      ],
    }).compile();

    controller = module.get<RafflesController>(RafflesController);
    service = module.get<RafflesService>(RafflesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a raffle', async () => {
      const createDto = {
        title: 'Test Raffle',
        description: 'Test Description',
        closingDate: '2025-12-31',
        ticketPrice: 10,
        maxTickets: 100,
      };

      mockRafflesService.create.mockResolvedValue(mockRaffle);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockRaffle);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all raffles', async () => {
      const raffles = [mockRaffle];
      mockRafflesService.findAll.mockResolvedValue(raffles);

      const result = await controller.findAll();

      expect(result).toEqual(raffles);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findActive', () => {
    it('should return active raffles', async () => {
      const raffles = [mockRaffle];
      mockRafflesService.findActive.mockResolvedValue(raffles);

      const result = await controller.findActive();

      expect(result).toEqual(raffles);
      expect(service.findActive).toHaveBeenCalled();
    });
  });

  describe('findWithWinners', () => {
    it('should return raffles with winners', async () => {
      const raffleWithWinner = { ...mockRaffle, winnerId: 'user-1' };
      mockRafflesService.findWithWinners.mockResolvedValue([raffleWithWinner]);

      const result = await controller.findWithWinners();

      expect(result).toEqual([raffleWithWinner]);
      expect(service.findWithWinners).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a raffle by id', async () => {
      mockRafflesService.findById.mockResolvedValue(mockRaffle);

      const result = await controller.findById('1');

      expect(result).toEqual(mockRaffle);
      expect(service.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if raffle not found', async () => {
      mockRafflesService.findById.mockResolvedValue(null);

      const result = await controller.findById('999');

      expect(result).toBeNull();
      expect(service.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('update', () => {
    it('should update a raffle', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedRaffle = { ...mockRaffle, title: 'Updated Title' };

      mockRafflesService.update.mockResolvedValue(updatedRaffle);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedRaffle);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException if raffle not found', async () => {
      const updateDto = { title: 'Updated Title' };
      mockRafflesService.update.mockRejectedValue(
        new NotFoundException('Raffle with ID 999 not found'),
      );

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a raffle', async () => {
      mockRafflesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(result).toEqual({ message: 'Raffle deleted successfully' });
      expect(service.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if raffle not found', async () => {
      mockRafflesService.delete.mockRejectedValue(
        new NotFoundException('Raffle with ID 999 not found'),
      );

      await expect(controller.delete('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setWinner', () => {
    it('should set winner for a raffle', async () => {
      const raffleWithWinner = { ...mockRaffle, winnerId: 'user-1' };
      mockRafflesService.setWinner.mockResolvedValue(raffleWithWinner);

      const result = await controller.setWinner('1', 'user-1');

      expect(result).toEqual(raffleWithWinner);
      expect(service.setWinner).toHaveBeenCalledWith('1', 'user-1');
    });

    it('should throw NotFoundException if raffle not found', async () => {
      mockRafflesService.setWinner.mockRejectedValue(
        new NotFoundException('Raffle with ID 999 not found'),
      );

      await expect(controller.setWinner('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
