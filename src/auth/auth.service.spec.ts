import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

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
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should return access token and user data for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userWithHashedPassword);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.login(email, password);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(email);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'testpassword123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userWithHashedPassword);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should include correct JWT payload', async () => {
      const email = 'test@example.com';
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userWithHashedPassword);
      
      const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      await service.login(email, password);

      expect(signSpy).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const token = 'valid-jwt-token';
      const mockPayload: JwtPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'CLIENT',
        iat: 1234567890,
        exp: 1234567890,
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

      const result = await service.validateToken(token);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-jwt-token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const token = 'expired-jwt-token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
