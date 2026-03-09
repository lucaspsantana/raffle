import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    purchase: jest.fn(),
    findByUser: jest.fn(),
    findByRaffle: jest.fn(),
  };

  const mockTicket = {
    id: 'ticket-1',
    number: 42,
    purchaseDate: new Date(),
    raffleId: 'raffle-1',
    userId: 'user-1',
  };

  const mockRequest = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      role: 'CLIENT',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('purchase', () => {
    it('should purchase a ticket successfully', async () => {
      const purchaseDto = { raffleId: 'raffle-1' };
      mockTicketsService.purchase.mockResolvedValue(mockTicket);

      const result = await controller.purchase(mockRequest, purchaseDto);

      expect(result).toEqual(mockTicket);
      expect(service.purchase).toHaveBeenCalledWith('user-1', 'raffle-1');
    });

    it('should throw NotFoundException if raffle not found', async () => {
      const purchaseDto = { raffleId: 'invalid-raffle' };
      mockTicketsService.purchase.mockRejectedValue(
        new NotFoundException('Raffle not found'),
      );

      await expect(
        controller.purchase(mockRequest, purchaseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if raffle is closed', async () => {
      const purchaseDto = { raffleId: 'raffle-1' };
      mockTicketsService.purchase.mockRejectedValue(
        new BadRequestException('This raffle is already closed'),
      );

      await expect(
        controller.purchase(mockRequest, purchaseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if raffle is sold out', async () => {
      const purchaseDto = { raffleId: 'raffle-1' };
      mockTicketsService.purchase.mockRejectedValue(
        new BadRequestException('This raffle is sold out'),
      );

      await expect(
        controller.purchase(mockRequest, purchaseDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyTickets', () => {
    it('should return all tickets for the authenticated user', async () => {
      const mockTickets = [
        {
          ...mockTicket,
          raffle: {
            id: 'raffle-1',
            title: 'Test Raffle',
            description: 'Test Description',
            closingDate: new Date('2025-12-31'),
            ticketPrice: 10,
            maxTickets: 100,
            imageUrl: 'test.jpg',
            winnerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockTicketsService.findByUser.mockResolvedValue(mockTickets);

      const result = await controller.getMyTickets(mockRequest);

      expect(result).toEqual(mockTickets);
      expect(service.findByUser).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array if user has no tickets', async () => {
      mockTicketsService.findByUser.mockResolvedValue([]);

      const result = await controller.getMyTickets(mockRequest);

      expect(result).toEqual([]);
      expect(service.findByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getRaffleTickets', () => {
    it('should return all tickets for a specific raffle', async () => {
      const mockTickets = [
        {
          ...mockTicket,
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'user@example.com',
            cpf: '12345678901',
          },
        },
      ];

      mockTicketsService.findByRaffle.mockResolvedValue(mockTickets);

      const result = await controller.getRaffleTickets('raffle-1');

      expect(result).toEqual(mockTickets);
      expect(service.findByRaffle).toHaveBeenCalledWith('raffle-1');
    });

    it('should return empty array if raffle has no tickets', async () => {
      mockTicketsService.findByRaffle.mockResolvedValue([]);

      const result = await controller.getRaffleTickets('raffle-1');

      expect(result).toEqual([]);
      expect(service.findByRaffle).toHaveBeenCalledWith('raffle-1');
    });
  });
});
