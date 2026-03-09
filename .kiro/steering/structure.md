---
inclusion: auto
---

# Project Structure

## Directory Organization

```
src/
├── auth/              # Authentication & authorization
│   ├── decorators/    # Custom decorators (e.g., @Roles)
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards (JWT, Roles)
│   └── strategies/    # Passport strategies
├── users/             # User management service
├── raffles/           # Raffle CRUD operations
│   └── dto/           # Raffle DTOs
├── tickets/           # Ticket purchase & management
│   └── dto/           # Ticket DTOs
├── uploads/           # File upload handling
├── prisma/            # Prisma service & module
└── common/            # Shared utilities
    ├── exceptions/    # Custom exception classes
    ├── filters/       # Exception filters
    └── validators/    # Custom validators (CPF, dates)
```

## Architectural Patterns

### Module Structure
- Each feature is a NestJS module with controller, service, and DTOs
- Modules import `PrismaModule` for database access
- Services contain business logic, controllers handle HTTP

### File Naming Conventions
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- DTOs: `*.dto.ts`
- Guards: `*.guard.ts`
- Decorators: `*.decorator.ts`
- Tests: `*.spec.ts` (co-located with source)

### Code Organization Principles
- DTOs use class-validator decorators for validation
- Custom validators in `common/validators/`
- Custom exceptions in `common/exceptions/`
- Guards and decorators for authorization
- Swagger decorators for API documentation

### Database Access
- All database operations through Prisma ORM
- Schema defined in `prisma/schema.prisma`
- Migrations in `prisma/migrations/`
- Seed scripts in `prisma/seed.ts`

### Testing Structure
- Unit tests co-located with source files
- E2E tests in `test/` directory
- Prisma client mocked in `__mocks__/@prisma/client.ts`
- Test configuration in `jest.config.js`

## Key Conventions

- Use dependency injection for all services
- Apply guards at controller or route level
- Validate all inputs with class-validator
- Document all endpoints with Swagger decorators
- Handle errors with custom exception classes
- Use TypeScript strict null checks
