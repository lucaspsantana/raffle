# Documento de Design - Fique Ryco

## Visão Geral

O sistema Fique Ryco é uma API REST desenvolvida em NestJS que gerencia rifas online. O sistema permite que administradores criem e gerenciem rifas, enquanto clientes podem se cadastrar, comprar bilhetes e visualizar resultados. A arquitetura segue os princípios de Clean Architecture e Domain-Driven Design, com separação clara de responsabilidades entre camadas.

### Tecnologias Principais

- **Framework**: NestJS (Node.js)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (recomendado) ou MySQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator e class-transformer
- **Upload de Arquivos**: Armazenamento local no filesystem

### Princípios de Design

1. **Separação de Responsabilidades**: Controllers, Services, Repositories
2. **Injeção de Dependências**: Uso do sistema DI do NestJS
3. **Validação em Camadas**: DTOs com decorators de validação
4. **Segurança**: Guards para autenticação e autorização
5. **Atomicidade**: Transações para operações críticas

## Arquitetura

### Estrutura de Módulos

```
src/
├── auth/                    # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/                   # Módulo de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── login.dto.ts
├── raffles/                 # Módulo de rifas
│   ├── raffles.controller.ts
│   ├── raffles.service.ts
│   ├── raffles.module.ts
│   └── dto/
│       ├── create-raffle.dto.ts
│       └── update-raffle.dto.ts
├── tickets/                 # Módulo de bilhetes
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   ├── tickets.module.ts
│   └── dto/
│       └── purchase-ticket.dto.ts
├── uploads/                 # Módulo de upload de arquivos
│   ├── uploads.controller.ts
│   ├── uploads.service.ts
│   └── uploads.module.ts
├── prisma/                  # Módulo Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── common/                  # Utilitários compartilhados
    ├── filters/
    ├── interceptors/
    └── validators/
```

### Fluxo de Requisições

1. **Cliente** → HTTP Request
2. **Controller** → Recebe requisição, valida DTOs
3. **Guard** → Verifica autenticação e autorização
4. **Service** → Lógica de negócio
5. **Prisma** → Acesso ao banco de dados
6. **Response** → Retorna dados ao cliente

## Componentes e Interfaces

### 1. Módulo de Autenticação (Auth)

#### AuthService

Responsável pela lógica de autenticação e geração de tokens JWT.

```typescript
interface AuthService {
  // Valida credenciais e retorna token JWT
  login(email: string, password: string): Promise<{ access_token: string, user: UserResponse }>;
  
  // Valida token JWT e retorna payload
  validateToken(token: string): Promise<JwtPayload>;
  
  // Gera hash de senha
  hashPassword(password: string): Promise<string>;
  
  // Compara senha com hash
  comparePasswords(password: string, hash: string): Promise<boolean>;
}

interface JwtPayload {
  sub: string;        // User ID
  email: string;
  role: UserRole;     // 'ADMIN' | 'CLIENT'
  iat: number;
  exp: number;
}
```

#### Guards

**JwtAuthGuard**: Valida presença e validade do token JWT em todas as rotas protegidas.

**RolesGuard**: Valida se o usuário tem a role necessária para acessar a rota.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user.role);
  }
}
```

### 2. Módulo de Usuários (Users)

#### UsersService

Gerencia operações relacionadas a usuários (Admin e Cliente).

```typescript
interface UsersService {
  // Cria novo cliente com CPF
  createClient(data: CreateClientDto): Promise<User>;
  
  // Busca usuário por email
  findByEmail(email: string): Promise<User | null>;
  
  // Busca usuário por CPF
  findByCpf(cpf: string): Promise<User | null>;
  
  // Busca usuário por ID
  findById(id: string): Promise<User | null>;
  
  // Valida formato de CPF
  validateCpf(cpf: string): boolean;
}
```

#### DTOs

```typescript
class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Matches(/^\d{11}$/)
  cpf: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### 3. Módulo de Rifas (Raffles)

#### RafflesService

Gerencia CRUD de rifas e lógica de negócio relacionada.

```typescript
interface RafflesService {
  // Cria nova rifa (apenas Admin)
  create(data: CreateRaffleDto): Promise<Raffle>;
  
  // Atualiza rifa existente (apenas Admin)
  update(id: string, data: UpdateRaffleDto): Promise<Raffle>;
  
  // Lista todas as rifas
  findAll(): Promise<Raffle[]>;
  
  // Lista rifas ativas (não encerradas)
  findActive(): Promise<Raffle[]>;
  
  // Lista rifas encerradas com ganhador
  findWithWinners(): Promise<Raffle[]>;
  
  // Busca rifa por ID
  findById(id: string): Promise<Raffle | null>;
  
  // Deleta rifa (apenas Admin)
  delete(id: string): Promise<void>;
  
  // Define ganhador de uma rifa
  setWinner(raffleId: string, ticketId: string): Promise<Raffle>;
  
  // Verifica se rifa está ativa
  isActive(raffle: Raffle): boolean;
  
  // Verifica se rifa ainda tem cotas disponíveis
  hasAvailableTickets(raffleId: string): Promise<boolean>;
  
  // Retorna número de cotas disponíveis
  getAvailableTicketsCount(raffleId: string): Promise<number>;
}
```

#### DTOs

```typescript
class CreateRaffleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsAfter(new Date())
  closingDate: string;

  @IsNumber()
  @IsPositive()
  ticketPrice: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  maxTickets: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

class UpdateRaffleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  closingDate?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  ticketPrice?: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  maxTickets?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  winnerId?: string;
}
```

### 4. Módulo de Bilhetes (Tickets)

#### TicketsService

Gerencia compra de bilhetes com controle de concorrência.

```typescript
interface TicketsService {
  // Compra bilhete com número aleatório único
  purchase(userId: string, raffleId: string): Promise<Ticket>;
  
  // Gera número aleatório único para a rifa
  generateUniqueTicketNumber(raffleId: string): Promise<number>;
  
  // Lista bilhetes de um cliente
  findByUser(userId: string): Promise<Ticket[]>;
  
  // Lista bilhetes de uma rifa
  findByRaffle(raffleId: string): Promise<Ticket[]>;
  
  // Verifica se número já foi vendido
  isNumberTaken(raffleId: string, number: number): Promise<boolean>;
}
```

#### Estratégia de Geração de Números Únicos

Para garantir unicidade e evitar concorrência, utilizaremos:

1. **Constraint de Unicidade no Banco**: `@@unique([raffleId, number])`
2. **Transações Atômicas**: Toda compra dentro de uma transação
3. **Retry Logic**: Se número duplicado, gera novo automaticamente
4. **Isolation Level**: `READ COMMITTED` ou `SERIALIZABLE` para operações críticas

```typescript
async generateUniqueTicketNumber(raffleId: string): Promise<number> {
  const maxAttempts = 10;
  let attempts = 0;
  
  // Busca o número máximo de cotas da rifa
  const raffle = await this.prisma.raffle.findUnique({ 
    where: { id: raffleId },
    select: { maxTickets: true }
  });
  
  if (!raffle) {
    throw new NotFoundException('Raffle not found');
  }
  
  while (attempts < maxAttempts) {
    // Gera número aleatório entre 1 e maxTickets
    const randomNumber = Math.floor(Math.random() * raffle.maxTickets) + 1;
    
    const exists = await this.isNumberTaken(raffleId, randomNumber);
    
    if (!exists) {
      return randomNumber;
    }
    
    attempts++;
  }
  
  throw new Error('Unable to generate unique ticket number');
}

async purchase(userId: string, raffleId: string): Promise<Ticket> {
  return await this.prisma.$transaction(async (tx) => {
    // Verifica se rifa está ativa
    const raffle = await tx.raffle.findUnique({ 
      where: { id: raffleId },
      include: { _count: { select: { tickets: true } } }
    });
    
    if (!raffle || new Date(raffle.closingDate) < new Date()) {
      throw new BadRequestException('Raffle is not active');
    }
    
    // Verifica se ainda há cotas disponíveis
    if (raffle._count.tickets >= raffle.maxTickets) {
      throw new BadRequestException('Raffle is sold out');
    }
    
    // Gera número único
    const ticketNumber = await this.generateUniqueTicketNumber(raffleId);
    
    // Cria bilhete
    try {
      return await tx.ticket.create({
        data: {
          number: ticketNumber,
          raffleId,
          userId,
          purchaseDate: new Date(),
        },
      });
    } catch (error) {
      // Se falhar por duplicação, tenta novamente
      if (error.code === 'P2002') {
        return this.purchase(userId, raffleId);
      }
      throw error;
    }
  }, {
    isolationLevel: 'Serializable',
  });
}
```

### 5. Módulo de Uploads

#### UploadsService

Gerencia upload e armazenamento de imagens no filesystem.

```typescript
interface UploadsService {
  // Salva arquivo no filesystem
  saveFile(file: Express.Multer.File): Promise<string>;
  
  // Deleta arquivo do filesystem
  deleteFile(filename: string): Promise<void>;
  
  // Gera nome único para arquivo
  generateFilename(originalName: string): string;
  
  // Valida tipo de arquivo
  validateFileType(mimetype: string): boolean;
}
```

Configuração de armazenamento:

```typescript
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    cb(null, `raffle-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Only image files are allowed'), false);
  }
};
```

## Modelos de Dados

### Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  CLIENT
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(CLIENT)
  cpf       String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tickets   Ticket[]
  
  @@index([email])
  @@index([cpf])
}

model Raffle {
  id          String    @id @default(uuid())
  title       String
  description String
  closingDate DateTime
  ticketPrice Decimal   @db.Decimal(10, 2)
  maxTickets  Int
  imageUrl    String?
  winnerId    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  tickets     Ticket[]
  
  @@index([closingDate])
}

model Ticket {
  id           String   @id @default(uuid())
  number       Int
  purchaseDate DateTime @default(now())
  raffleId     String
  userId       String
  
  raffle       Raffle   @relation(fields: [raffleId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([raffleId, number])
  @@index([userId])
  @@index([raffleId])
}
```

### Relacionamentos

- **User → Ticket**: Um usuário pode ter múltiplos bilhetes (1:N)
- **Raffle → Ticket**: Uma rifa pode ter múltiplos bilhetes (1:N)
- **Raffle → Winner**: Uma rifa pode ter um ganhador (1:1 opcional)

### Constraints Importantes

1. **@@unique([raffleId, number])**: Garante que cada número é único dentro de uma rifa
2. **@unique cpf**: Garante que cada CPF é único no sistema
3. **@unique email**: Garante que cada email é único no sistema
4. **onDelete: Cascade**: Quando uma rifa é deletada, seus bilhetes também são

## Rotas da API

### Autenticação

```
POST   /auth/register          # Cadastro de cliente
POST   /auth/login             # Login (Admin ou Cliente)
```

### Rifas (Admin)

```
POST   /raffles                # Criar rifa [Admin]
GET    /raffles                # Listar todas as rifas
GET    /raffles/:id            # Buscar rifa por ID
PATCH  /raffles/:id            # Atualizar rifa [Admin]
DELETE /raffles/:id            # Deletar rifa [Admin]
PATCH  /raffles/:id/winner     # Definir ganhador [Admin]
```

### Rifas (Cliente)

```
GET    /raffles/active         # Listar rifas ativas
GET    /raffles/winners        # Listar rifas com ganhadores
```

### Bilhetes

```
POST   /tickets/purchase       # Comprar bilhete [Cliente]
GET    /tickets/my-tickets     # Listar meus bilhetes [Cliente]
GET    /tickets/raffle/:id     # Listar bilhetes de uma rifa [Admin]
```

### Upload

```
POST   /uploads                # Upload de imagem [Admin]
GET    /uploads/:filename      # Servir imagem
```

## Tratamento de Erros

### Hierarquia de Exceções

```typescript
// Exceções customizadas
class RaffleNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Raffle with ID ${id} not found`);
  }
}

class RaffleClosedException extends BadRequestException {
  constructor() {
    super('This raffle is already closed');
  }
}

class DuplicateCpfException extends ConflictException {
  constructor() {
    super('CPF already registered');
  }
}

class InvalidCpfException extends BadRequestException {
  constructor() {
    super('Invalid CPF format');
  }
}

class UnauthorizedException extends HttpException {
  constructor() {
    super('Unauthorized access', HttpStatus.UNAUTHORIZED);
  }
}
```

### Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Estratégia de Testes

O sistema Fique Ryco utilizará uma abordagem dual de testes para garantir corretude e confiabilidade:

### Testes Unitários

Focados em casos específicos, edge cases e condições de erro:

- Validação de CPF com formatos válidos e inválidos
- Validação de datas de encerramento
- Geração de nomes únicos de arquivos
- Hashing e comparação de senhas
- Casos de erro específicos (rifa encerrada, CPF duplicado, etc.)

### Testes Baseados em Propriedades

Focados em propriedades universais que devem ser verdadeiras para todos os inputs:

- Unicidade de números de bilhetes
- Integridade de transações de compra
- Consistência de dados após operações
- Comportamento sob concorrência

### Configuração de Testes

**Framework**: Jest (padrão do NestJS)
**Property-Based Testing**: fast-check

Cada teste de propriedade deve:
- Executar no mínimo 100 iterações
- Ser tagado com referência à propriedade do design
- Formato: `Feature: fique-ryco, Property {N}: {descrição}`

### Cobertura de Testes

- Services: Lógica de negócio crítica
- Guards: Autenticação e autorização
- Validadores: CPF, datas, formatos
- Geração de números únicos: Concorrência e unicidade
- Transações: Atomicidade e isolamento



## Propriedades de Corretude

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. Propriedades servem como ponte entre especificações legíveis por humanos e garantias de corretude verificáveis por máquina.*

### Propriedade 1: Autenticação com Credenciais Válidas

*Para qualquer* usuário registrado com credenciais válidas, quando o sistema autentica esse usuário, deve retornar um token JWT válido que pode ser usado para acessar rotas protegidas.

**Valida: Requisitos 1.1, 1.3**

### Propriedade 2: Rejeição de Credenciais Inválidas

*Para qualquer* combinação de email e senha que não corresponda a um usuário registrado, o sistema deve rejeitar a tentativa de autenticação e retornar erro.

**Valida: Requisitos 1.2**

### Propriedade 3: Rejeição de Tokens Inválidos

*Para qualquer* token JWT inválido, expirado ou malformado, o sistema deve negar acesso a rotas protegidas e retornar erro de autenticação.

**Valida: Requisitos 1.4**

### Propriedade 4: Unicidade de CPF no Cadastro

*Para qualquer* CPF já cadastrado no sistema, tentativas de criar um novo usuário com o mesmo CPF devem ser rejeitadas com erro de conflito.

**Valida: Requisitos 2.2**

### Propriedade 5: Validação de Formato de CPF

*Para qualquer* string que não corresponda ao formato válido de CPF (11 dígitos numéricos), o sistema deve rejeitar o cadastro e retornar erro de validação.

**Valida: Requisitos 2.3, 11.2**

### Propriedade 6: Criação de Cliente com Dados Válidos

*Para qualquer* conjunto de dados válidos (nome, email, senha, CPF único), o sistema deve criar uma nova conta de cliente e permitir login subsequente.

**Valida: Requisitos 2.1**

### Propriedade 7: CRUD de Rifas por Admin

*Para qualquer* rifa criada por um admin com dados válidos, o sistema deve armazenar a rifa e permitir operações de leitura, atualização e exclusão subsequentes.

**Valida: Requisitos 3.1, 3.2, 3.3, 3.4**

### Propriedade 8: Unicidade de Números de Bilhetes

*Para qualquer* rifa, todos os bilhetes vendidos devem ter números únicos, mesmo quando milhares de compras ocorrem simultaneamente por múltiplos clientes.

**Valida: Requisitos 5.1, 5.3, 5.4, 5.7, 6.1, 6.4**

**Nota**: Esta é a propriedade mais crítica do sistema. Deve ser testada com alta concorrência (múltiplas threads/processos comprando simultaneamente).

### Propriedade 9: Números de Bilhetes no Intervalo Válido

*Para qualquer* bilhete vendido em uma rifa, o número do bilhete deve estar no intervalo de 1 até o número máximo de cotas definido para aquela rifa.

**Valida: Requisitos 6.9**

### Propriedade 10: Limite de Cotas Respeitado

*Para qualquer* rifa com número máximo de cotas N, o sistema deve rejeitar tentativas de compra quando N bilhetes já foram vendidos, mesmo sob alta concorrência.

**Valida: Requisitos 6.3**

### Propriedade 11: Disponibilidade de Cotas Calculada Corretamente

*Para qualquer* rifa, o número de cotas disponíveis deve ser igual ao número máximo de cotas menos o número de bilhetes já vendidos.

**Valida: Requisitos 5.1, 5.2, 5.3**

### Propriedade 12: Rejeição de Compra em Rifa Encerrada

### Propriedade 12: Rejeição de Compra em Rifa Encerrada

*Para qualquer* rifa com data de encerramento no passado, tentativas de compra de bilhetes devem ser rejeitadas com erro indicando que a rifa está encerrada.

**Valida: Requisitos 6.2**

### Propriedade 13: Múltiplas Compras com Números Únicos

*Para qualquer* cliente que compre N bilhetes da mesma rifa, todos os N bilhetes devem ter números diferentes entre si.

**Valida: Requisitos 6.8**

### Propriedade 14: Listagem de Rifas Ativas

*Para qualquer* conjunto de rifas no sistema, a listagem de rifas ativas deve retornar apenas rifas com data de encerramento futura, ordenadas por data de encerramento.

**Valida: Requisitos 4.1, 4.3, 4.4**

### Propriedade 15: Completude de Dados de Rifa

*Para qualquer* rifa retornada pela API, a resposta deve conter todos os campos obrigatórios: título, descrição, data de encerramento, valor da ação, número máximo de cotas e URL da foto (se existir).

**Valida: Requisitos 4.2**

### Propriedade 16: Listagem de Compras do Cliente

*Para qualquer* cliente que comprou N bilhetes, a listagem de suas compras deve retornar exatamente N bilhetes com seus números e detalhes das rifas associadas, ordenados por data de compra.

**Valida: Requisitos 8.1, 8.2, 8.3, 8.4**

### Propriedade 17: Listagem de Ganhadores

*Para qualquer* conjunto de rifas no sistema, a listagem de ganhadores deve retornar apenas rifas encerradas que possuem ganhador definido, com dados completos do ganhador, ordenadas por data de encerramento.

**Valida: Requisitos 9.1, 9.2, 9.4**

### Propriedade 18: Controle de Acesso - Cliente vs Admin

*Para qualquer* rota administrativa (criar/atualizar/excluir rifas), requisições com token de Cliente devem ser rejeitadas com erro de autorização, enquanto requisições com token de Admin devem ser permitidas.

**Valida: Requisitos 10.1, 10.2, 10.5**

### Propriedade 19: Controle de Acesso - Não Autenticado

*Para qualquer* rota protegida, requisições sem token JWT válido devem ser rejeitadas com erro de autenticação.

**Valida: Requisitos 10.3**

### Propriedade 20: Upload e Armazenamento de Imagens

*Para qualquer* arquivo de imagem válido (jpg, jpeg, png, gif) enviado por um admin, o sistema deve armazenar o arquivo com nome único e retornar uma URL acessível.

**Valida: Requisitos 11.1, 11.3, 11.4**

### Propriedade 21: Rejeição de Arquivos Inválidos

*Para qualquer* arquivo que não seja uma imagem válida, o sistema deve rejeitar o upload e retornar erro de validação.

**Valida: Requisitos 11.2**

### Propriedade 22: Remoção em Cascata de Imagens

*Para qualquer* rifa com imagem associada, quando a rifa é excluída, o arquivo de imagem deve ser removido do sistema de arquivos.

**Valida: Requisitos 11.5**

### Propriedade 23: Validação de Email

*Para qualquer* string que não corresponda ao formato válido de email, o sistema deve rejeitar a requisição e retornar erro de validação.

**Valida: Requisitos 12.3**

### Propriedade 24: Validação de Data de Encerramento

*Para qualquer* tentativa de criar rifa com data de encerramento no passado, o sistema deve rejeitar a criação e retornar erro de validação.

**Valida: Requisitos 12.4**

### Propriedade 25: Validação de Valor Positivo

*Para qualquer* tentativa de criar rifa com valor de ação não-positivo (zero ou negativo), o sistema deve rejeitar a criação e retornar erro de validação.

**Valida: Requisitos 12.5**

### Propriedade 26: Validação de Número Máximo de Cotas

*Para qualquer* tentativa de criar rifa com número máximo de cotas não-positivo (zero ou negativo), o sistema deve rejeitar a criação e retornar erro de validação.

**Valida: Requisitos 3.7**

### Propriedade 27: Validação de Campos Obrigatórios

*Para qualquer* requisição com campos obrigatórios ausentes, o sistema deve rejeitar a requisição e retornar erro descritivo indicando quais campos estão faltando.

**Valida: Requisitos 12.1, 12.6**

