import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';

/**
 * Testes para JwtStrategy
 * Valida: Requisitos 1.3, 1.4
 */
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'CLIENT' as const,
    cpf: '12345678901',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data for valid payload with existing user', async () => {
      const payload: JwtPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      });
      expect(result).not.toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload: JwtPayload = {
        sub: 'non-existent-id',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow('User not found');
    });

    it('should validate admin user correctly', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' as const };
      const payload: JwtPayload = {
        sub: '1',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(adminUser);

      const result = await strategy.validate(payload);

      expect(result.role).toBe('ADMIN');
      expect(result.id).toBe(adminUser.id);
    });

    it('should validate client user correctly', async () => {
      const payload: JwtPayload = {
        sub: '1',
        email: 'client@example.com',
        role: 'CLIENT',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result.role).toBe('CLIENT');
      expect(result.id).toBe(mockUser.id);
    });

    it('should not include sensitive data in returned user object', async () => {
      const payload: JwtPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('cpf');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });
});
