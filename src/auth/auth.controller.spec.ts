import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    hashPassword: jest.fn(),
    login: jest.fn(),
  };

  const mockUsersService = {
    createClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new client successfully', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678901',
      };

      const hashedPassword = 'hashed_password';
      const createdUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        cpf: '12345678901',
        role: UserRole.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockUsersService.createClient.mockResolvedValue(createdUser);

      const result = await controller.register(createClientDto);

      expect(authService.hashPassword).toHaveBeenCalledWith('password123');
      expect(usersService.createClient).toHaveBeenCalledWith(
        createClientDto,
        hashedPassword,
      );
      expect(result).toEqual({
        message: 'Client registered successfully',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '12345678901',
          role: UserRole.CLIENT,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt,
        },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException when CPF already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678901',
      };

      mockAuthService.hashPassword.mockResolvedValue('hashed_password');
      mockUsersService.createClient.mockRejectedValue(
        new ConflictException('CPF already registered'),
      );

      await expect(controller.register(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createClientDto: CreateClientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        cpf: '12345678901',
      };

      mockAuthService.hashPassword.mockResolvedValue('hashed_password');
      mockUsersService.createClient.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(controller.register(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const loginResult = {
        access_token: 'jwt_token',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: UserRole.CLIENT,
        },
      };

      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
      );
      expect(result).toEqual(loginResult);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrong_password',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
