# Plano de Implementação: Fique Ryco

## Visão Geral

Este plano detalha a implementação do sistema de rifas online "Fique Ryco" usando NestJS, Prisma ORM e PostgreSQL. A implementação seguirá uma abordagem incremental, construindo funcionalidades core primeiro e adicionando features progressivamente.

## Tasks

- [x] 1. Configurar estrutura inicial do projeto
  - Inicializar projeto NestJS
  - Configurar Prisma com PostgreSQL
  - Configurar variáveis de ambiente (.env)
  - Instalar dependências necessárias (bcrypt, @nestjs/jwt, @nestjs/passport, class-validator, class-transformer)
  - Criar estrutura de diretórios para uploads
  - _Requisitos: Todos_

- [x] 2. Implementar schema do banco de dados com Prisma
  - [x] 2.1 Criar schema Prisma com models User, Raffle e Ticket
    - Definir enum UserRole (ADMIN, CLIENT)
    - Definir model User com campos: id, email, password, name, role, cpf, timestamps
    - Definir model Raffle com campos: id, title, description, closingDate, ticketPrice, maxTickets, imageUrl, winnerId, timestamps
    - Definir model Ticket com campos: id, number, purchaseDate, raffleId, userId
    - Adicionar constraints: @@unique([raffleId, number]), @unique cpf, @unique email
    - Adicionar indexes para performance
    - Adicionar relações entre models com onDelete: Cascade
    - _Requisitos: 2.1, 3.1, 5.1, 6.3, 6.4_
  
  - [x] 2.2 Executar migrations do Prisma
    - Gerar migration inicial
    - Aplicar migration no banco de dados
    - Gerar Prisma Client
    - _Requisitos: Todos_

- [x] 3. Criar módulo Prisma e serviço base
  - [x] 3.1 Implementar PrismaService
    - Criar serviço que estende PrismaClient
    - Implementar lifecycle hooks (onModuleInit, enableShutdownHooks)
    - _Requisitos: Todos_
  
  - [x] 3.2 Criar PrismaModule
    - Exportar PrismaService para uso global
    - _Requisitos: Todos_

- [x] 4. Implementar módulo de autenticação (Auth)
  - [x] 4.1 Criar AuthService com lógica de autenticação
    - Implementar método hashPassword usando bcrypt
    - Implementar método comparePasswords
    - Implementar método login que valida credenciais e retorna JWT
    - Implementar método validateToken
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 4.2 Criar JwtStrategy para validação de tokens
    - Configurar estratégia Passport JWT
    - Extrair e validar payload do token
    - _Requisitos: 1.3, 1.4_
  
  - [x] 4.3 Criar Guards de autenticação e autorização
    - Implementar JwtAuthGuard para proteger rotas
    - Implementar RolesGuard para verificar roles (Admin/Cliente)
    - Criar decorator @Roles para marcar rotas
    - _Requisitos: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 4.4 Criar AuthController com rotas de login e registro
    - POST /auth/register - cadastro de cliente
    - POST /auth/login - login de usuário
    - _Requisitos: 1.1, 2.1_
  
  - [x] 4.5 Criar DTOs de autenticação com validações
    - CreateClientDto com validações de CPF, email, senha
    - LoginDto com validações de email e senha
    - _Requisitos: 2.1, 2.3, 11.2, 11.3, 11.6_

- [x] 5. Implementar módulo de usuários (Users)
  - [x] 5.1 Criar UsersService
    - Implementar createClient para cadastro de clientes
    - Implementar findByEmail para busca por email
    - Implementar findByCpf para busca por CPF
    - Implementar findById para busca por ID
    - Implementar validateCpf para validação de formato de CPF
    - _Requisitos: 2.1, 2.2, 2.3, 11.2_
  
  - [x] 5.2 Adicionar validações de unicidade
    - Verificar CPF único antes de criar cliente
    - Verificar email único antes de criar cliente
    - Retornar erros apropriados para duplicações
    - _Requisitos: 2.2, 11.1_

- [x] 6. Checkpoint - Testar autenticação e cadastro
  - Garantir que todos os testes passem, perguntar ao usuário se há dúvidas.

- [x] 7. Implementar módulo de rifas (Raffles)
  - [x] 7.1 Criar RafflesService com CRUD completo
    - Implementar create para criar rifas (apenas Admin)
    - Implementar update para atualizar rifas (apenas Admin)
    - Implementar findAll para listar todas as rifas
    - Implementar findActive para listar rifas ativas
    - Implementar findWithWinners para listar rifas com ganhadores
    - Implementar findById para buscar rifa por ID
    - Implementar delete para excluir rifas (apenas Admin)
    - Implementar setWinner para definir ganhador
    - Implementar isActive para verificar se rifa está ativa
    - Implementar hasAvailableTickets para verificar disponibilidade
    - Implementar getAvailableTicketsCount para contar cotas disponíveis
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 4.1, 4.3, 4.4, 5.1, 5.2_
  
  - [x] 7.2 Criar RafflesController com rotas protegidas
    - POST /raffles - criar rifa [Admin]
    - GET /raffles - listar todas as rifas
    - GET /raffles/active - listar rifas ativas
    - GET /raffles/winners - listar rifas com ganhadores
    - GET /raffles/:id - buscar rifa por ID
    - PATCH /raffles/:id - atualizar rifa [Admin]
    - DELETE /raffles/:id - deletar rifa [Admin]
    - PATCH /raffles/:id/winner - definir ganhador [Admin]
    - Aplicar Guards apropriados (JwtAuthGuard, RolesGuard)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 4.1, 8.1, 9.1, 9.2_
  
  - [x] 7.3 Criar DTOs de rifas com validações
    - CreateRaffleDto com validações de título, descrição, data, preço, maxTickets
    - UpdateRaffleDto com validações opcionais
    - Validar que closingDate seja futura
    - Validar que ticketPrice seja positivo
    - Validar que maxTickets seja positivo e maior que zero
    - _Requisitos: 3.1, 3.7, 11.4, 11.5, 11.6_

- [x] 8. Implementar módulo de bilhetes (Tickets) com controle de concorrência
  - [x] 8.1 Criar TicketsService com lógica de compra
    - Implementar generateUniqueTicketNumber com geração aleatória no intervalo [1, maxTickets]
    - Implementar purchase com transação Prisma e isolation level Serializable
    - Verificar se rifa está ativa antes de comprar
    - Verificar se ainda há cotas disponíveis
    - Implementar retry logic para números duplicados
    - Implementar isNumberTaken para verificar disponibilidade de número
    - Implementar findByUser para listar bilhetes do cliente
    - Implementar findByRaffle para listar bilhetes de uma rifa
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.7, 6.1, 6.3, 6.4, 6.9, 7.1_
  
  - [x] 8.2 Criar TicketsController com rotas de compra
    - POST /tickets/purchase - comprar bilhete [Cliente]
    - GET /tickets/my-tickets - listar meus bilhetes [Cliente]
    - GET /tickets/raffle/:id - listar bilhetes de uma rifa [Admin]
    - Aplicar Guards apropriados
    - _Requisitos: 6.1, 7.1, 7.2, 7.3, 9.1, 9.2_
  
  - [x] 8.3 Criar DTOs de bilhetes
    - PurchaseTicketDto com validação de raffleId
    - _Requisitos: 6.1, 11.6_

- [x] 9. Checkpoint - Testar compra de bilhetes e concorrência
  - Garantir que todos os testes passem, perguntar ao usuário se há dúvidas.

- [x] 10. Implementar módulo de upload de imagens (Uploads)
  - [x] 10.1 Criar UploadsService
    - Implementar saveFile para salvar arquivo no filesystem
    - Implementar deleteFile para remover arquivo
    - Implementar generateFilename para gerar nomes únicos
    - Implementar validateFileType para validar tipos de imagem
    - _Requisitos: 10.1, 10.2, 10.3, 10.5_
  
  - [x] 10.2 Criar UploadsController com configuração Multer
    - POST /uploads - upload de imagem [Admin]
    - GET /uploads/:filename - servir imagem
    - Configurar diskStorage com destination e filename
    - Configurar fileFilter para aceitar apenas imagens
    - Aplicar Guards apropriados
    - _Requisitos: 10.1, 10.2, 10.4_

- [x] 11. Implementar tratamento global de erros
  - [x] 11.1 Criar exceções customizadas
    - RaffleNotFoundException
    - RaffleClosedException
    - RaffleSoldOutException
    - DuplicateCpfException
    - InvalidCpfException
    - _Requisitos: 5.2, 6.3, 11.1_
  
  - [x] 11.2 Criar AllExceptionsFilter
    - Capturar todas as exceções
    - Formatar resposta de erro padronizada
    - Incluir statusCode, timestamp, path e message
    - _Requisitos: 11.1_

- [x] 12. Implementar validadores customizados
  - [x] 12.1 Criar validador de CPF
    - Validar formato (11 dígitos)
    - Validar dígitos verificadores
    - _Requisitos: 2.3, 11.2_
  
  - [x] 12.2 Criar validador de data futura
    - Validar que data de encerramento seja futura
    - _Requisitos: 11.4_

- [x] 13. Integrar remoção de imagens ao deletar rifas
  - [x] 13.1 Atualizar RafflesService.delete
    - Buscar URL da imagem antes de deletar rifa
    - Chamar UploadsService.deleteFile após deletar rifa
    - Garantir que operação seja atômica
    - _Requisitos: 10.5_

- [x] 14. Adicionar seed de usuário Admin
  - [x] 14.1 Criar script de seed no Prisma
    - Criar usuário Admin padrão para testes
    - Hash de senha usando bcrypt
    - _Requisitos: 1.1, 9.2_

- [x] 15. Configurar CORS e segurança
  - [x] 15.1 Configurar CORS no main.ts
    - Permitir origens específicas
    - _Requisitos: Todos_
  
  - [x] 15.2 Adicionar helmet para segurança HTTP
    - Configurar headers de segurança
    - _Requisitos: Todos_

- [x] 16. Criar documentação de API
  - [x] 16.1 Adicionar Swagger/OpenAPI
    - Instalar @nestjs/swagger
    - Configurar SwaggerModule no main.ts
    - Adicionar decorators nos DTOs e Controllers
    - _Requisitos: Todos_

- [x] 17. Checkpoint final - Validação completa do sistema
  - Garantir que todos os testes passem, perguntar ao usuário se há dúvidas.

## Notas

- Todas as rotas administrativas devem ser protegidas com JwtAuthGuard e RolesGuard
- Todas as rotas de cliente devem ser protegidas com JwtAuthGuard
- A propriedade de unicidade de números de bilhetes é crítica e deve usar transações com isolation level Serializable
- O sistema deve lidar com milhares de compras simultâneas sem duplicar números
- Validações devem ser aplicadas em múltiplas camadas (DTOs, Services)
- Erros devem ser descritivos e seguir padrões HTTP apropriados
