export class PrismaClient {
  user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  raffle = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  ticket = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  $connect = jest.fn();
  $disconnect = jest.fn();
  $transaction = jest.fn();
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export namespace Prisma {
  export enum TransactionIsolationLevel {
    ReadUncommitted = 'ReadUncommitted',
    ReadCommitted = 'ReadCommitted',
    RepeatableRead = 'RepeatableRead',
    Serializable = 'Serializable',
  }

  export class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = 'PrismaClientKnownRequestError';
    }
  }
}
