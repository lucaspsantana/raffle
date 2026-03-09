---
inclusion: auto
---

# Technology Stack

## Core Technologies

- Framework: NestJS 11.x
- Runtime: Node.js 18+
- Language: TypeScript 5.7
- ORM: Prisma 7.4
- Database: PostgreSQL 14+
- Authentication: JWT (passport-jwt)
- Validation: class-validator, class-transformer
- File Upload: Multer (local storage)
- Security: Helmet
- API Documentation: Swagger/OpenAPI

## Build System

- Build tool: NestJS CLI
- Test runner: Jest 30.x
- Module resolution: nodenext
- Decorators: Enabled (experimentalDecorators)

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Lint and fix
npm run format             # Format with Prettier

# Database
npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed database
npx prisma studio          # Open Prisma Studio
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration (e.g., "7d")
- `UPLOAD_DIR`: Directory for file uploads (default: "./uploads")
- `CORS_ORIGIN`: Allowed CORS origin (default: "http://localhost:3001")

## Testing Configuration

- Test files: `*.spec.ts` co-located with source
- E2E tests: `test/` directory
- Prisma mocking: `__mocks__/@prisma/client.ts`
- Coverage output: `coverage/` directory
