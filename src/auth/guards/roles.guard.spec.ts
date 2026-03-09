import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'test@example.com',
        role: UserRole.CLIENT,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'client@example.com',
        role: UserRole.CLIENT,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return false when user is not present in request', () => {
      const mockContext = createMockExecutionContext(null);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return true when user has one of multiple required roles', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'client@example.com',
        role: UserRole.CLIENT,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.CLIENT]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false when user has none of multiple required roles', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'client@example.com',
        role: UserRole.CLIENT,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});

function createMockExecutionContext(user: any): ExecutionContext {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user,
      }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
}
