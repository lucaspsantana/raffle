import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateClientDto } from '../auth/dto/create-client.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClient', () => {
    it('should create a new client successfully', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678909',
      };

      const hashedPassword = 'hashed_password';

      const createdUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        cpf: '12345678909',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createClient(createClientDto, hashedPassword);

      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
          cpf: '12345678909',
          role: UserRole.CLIENT,
        },
      });
    });

    it('should throw ConflictException when CPF already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678909',
      };

      const existingUser = {
        id: '1',
        cpf: '12345678909',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(existingUser);

      await expect(
        service.createClient(createClientDto, 'hashed_password'),
      ).rejects.toThrow(new ConflictException('CPF already registered'));
    });

    it('should throw ConflictException when email already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678909',
      };

      const existingUser = {
        id: '1',
        email: 'john@example.com',
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // CPF check
        .mockResolvedValueOnce(existingUser); // Email check

      await expect(
        service.createClient(createClientDto, 'hashed_password'),
      ).rejects.toThrow(new ConflictException('Email already registered'));
    });

    it('should throw ConflictException when CPF format is invalid', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678900', // Invalid CPF
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createClient(createClientDto, 'hashed_password'),
      ).rejects.toThrow(new ConflictException('Invalid CPF format'));
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      const user = {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashed_password',
        cpf: '12345678909',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null when email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCpf', () => {
    it('should return user when CPF exists', async () => {
      const user = {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashed_password',
        cpf: '12345678909',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByCpf('12345678909');

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cpf: '12345678909' },
      });
    });

    it('should return null when CPF does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByCpf('12345678909');

      expect(result).toBeNull();
    });
  });

  describe('validateCpf', () => {
    it('should return true for valid CPF', () => {
      expect(service.validateCpf('12345678909')).toBe(true);
      expect(service.validateCpf('11144477735')).toBe(true);
    });

    it('should return false for CPF with invalid length', () => {
      expect(service.validateCpf('123456789')).toBe(false);
      expect(service.validateCpf('123456789012')).toBe(false);
    });

    it('should return false for CPF with all same digits', () => {
      expect(service.validateCpf('11111111111')).toBe(false);
      expect(service.validateCpf('00000000000')).toBe(false);
    });

    it('should return false for CPF with invalid check digits', () => {
      expect(service.validateCpf('12345678900')).toBe(false);
      expect(service.validateCpf('12345678901')).toBe(false);
    });

    it('should handle CPF with non-numeric characters', () => {
      expect(service.validateCpf('123.456.789-09')).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should update user name and phone', async () => {
      const userId = '1';
      const updateData = {
        name: 'Updated Name',
        phone: '11999999999',
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Old Name',
        role: UserRole.CLIENT,
        cpf: '12345678909',
        phone: '11987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result).toEqual({
        id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        role: UserRole.CLIENT,
        cpf: '12345678909',
        phone: '11999999999',
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should update password when current password is correct', async () => {
      const userId = '1';
      const bcrypt = require('bcrypt');
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword';
      const hashedOldPassword = await bcrypt.hash(currentPassword, 10);
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updateData = {
        currentPassword,
        newPassword,
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        password: hashedOldPassword,
        name: 'Test User',
        role: UserRole.CLIENT,
        cpf: '12345678909',
        phone: '11987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        password: hashedNewPassword,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateData);

      expect(result).not.toHaveProperty('password');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw error when current password is incorrect', async () => {
      const userId = '1';
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      const updateData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: UserRole.CLIENT,
        cpf: '12345678909',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(
        new ConflictException('Current password is incorrect'),
      );
    });

    it('should throw error when trying to change password without current password', async () => {
      const userId = '1';

      const updateData = {
        newPassword: 'newPassword',
      };

      const existingUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: UserRole.CLIENT,
        cpf: '12345678909',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(
        new ConflictException(
          'Current password is required to change password',
        ),
      );
    });

    it('should throw error when user not found', async () => {
      const userId = 'non-existent';
      const updateData = { name: 'New Name' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(
        new ConflictException('User not found'),
      );
    });
  });
});
