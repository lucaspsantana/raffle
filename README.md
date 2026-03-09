# Fique Ryco - Sistema de Rifas Online

Sistema de rifas online desenvolvido com NestJS, Prisma ORM e PostgreSQL. Permite que administradores gerenciem rifas e clientes comprem bilhetes.

## Tecnologias

- **Framework**: NestJS
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Validação**: class-validator e class-transformer
- **Upload**: Multer (armazenamento local)

## Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- npm ou yarn

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fique_ryco?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Upload
UPLOAD_DIR="./uploads"
```

### 3. Configurar Banco de Dados

Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:

```bash
createdb fique_ryco
```

### 4. Executar Migrations do Prisma

```bash
npx prisma migrate dev
```

### 5. (Opcional) Popular Banco com Dados Iniciais

```bash
npx prisma db seed
```

## Executar o Projeto

### Modo Desenvolvimento

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`

### Modo Produção

```bash
npm run build
npm run start:prod
```

## Documentação da API

A documentação interativa da API está disponível através do Swagger/OpenAPI.

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:3000/api
- **JSON da API**: http://localhost:3000/api-json

A documentação Swagger permite:
- Visualizar todos os endpoints disponíveis
- Ver os schemas de request/response
- Testar os endpoints diretamente no navegador
- Autenticar usando JWT Bearer token

### Como usar a autenticação no Swagger

1. Faça login através do endpoint `/auth/login`
2. Copie o `access_token` retornado
3. Clique no botão "Authorize" no topo da página do Swagger
4. Cole o token no campo "Value" (sem o prefixo "Bearer")
5. Clique em "Authorize" e depois "Close"
6. Agora você pode testar os endpoints protegidos

## Testes

```bash
# Testes unitários
npm test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Estrutura do Projeto

```
src/
├── auth/           # Autenticação e autorização
├── users/          # Gerenciamento de usuários
├── raffles/        # Gerenciamento de rifas
├── tickets/        # Compra e gerenciamento de bilhetes
├── uploads/        # Upload de imagens
├── prisma/         # Configuração do Prisma
└── common/         # Utilitários compartilhados
```

## Funcionalidades

- ✅ Autenticação JWT para Admin e Cliente
- ✅ Cadastro de clientes com CPF
- ✅ CRUD completo de rifas (Admin)
- ✅ Visualização de rifas ativas (Cliente)
- ✅ Compra de bilhetes com números únicos
- ✅ Controle de concorrência na compra
- ✅ Upload de imagens das rifas
- ✅ Visualização de ganhadores

## API Endpoints

### Autenticação
- `POST /auth/register` - Cadastro de cliente
- `POST /auth/login` - Login

### Rifas
- `POST /raffles` - Criar rifa [Admin]
- `GET /raffles` - Listar todas as rifas
- `GET /raffles/active` - Listar rifas ativas
- `GET /raffles/winners` - Listar ganhadores
- `PATCH /raffles/:id` - Atualizar rifa [Admin]
- `DELETE /raffles/:id` - Deletar rifa [Admin]

### Bilhetes
- `POST /tickets/purchase` - Comprar bilhete [Cliente]
- `GET /tickets/my-tickets` - Listar meus bilhetes [Cliente]

### Upload
- `POST /uploads` - Upload de imagem [Admin]

## Licença

UNLICENSED
# raffle
