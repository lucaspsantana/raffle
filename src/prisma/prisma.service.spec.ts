import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

// Mock do PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $connect = jest.fn().mockResolvedValue(undefined);
      $disconnect = jest.fn().mockResolvedValue(undefined);
    },
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeInstanceOf(PrismaService);
    expect(service.$connect).toBeDefined();
    expect(service.$disconnect).toBeDefined();
  });

  it('should connect to database on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should have enableShutdownHooks method', () => {
    expect(service.enableShutdownHooks).toBeDefined();
    expect(typeof service.enableShutdownHooks).toBe('function');
  });
});
