import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CLIENT',
    cpf: '12345678901',
    phone: '11987654321',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { id: '1' } };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const req = { user: { id: '1' } };
      const updateDto = { name: 'Updated Name', phone: '11999999999' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(req, updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.updateProfile).toHaveBeenCalledWith('1', updateDto);
    });

    it('should update password', async () => {
      const req = { user: { id: '1' } };
      const updateDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUser);

      const result = await controller.updateProfile(req, updateDto);

      expect(result).toEqual(mockUser);
      expect(service.updateProfile).toHaveBeenCalledWith('1', updateDto);
    });
  });
});
