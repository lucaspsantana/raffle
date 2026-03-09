# Guia Docker - Fique Ryco

## Executar com Docker Compose

O projeto está configurado para rodar completamente em containers Docker, incluindo o banco de dados PostgreSQL e a aplicação NestJS.

### Iniciar o Sistema

```bash
# Build e iniciar todos os serviços
docker compose up -d

# Ver logs
docker compose logs -f

# Ver logs apenas da aplicação
docker compose logs -f app
```

### Primeira Execução

Na primeira vez que você executar, o sistema irá:

1. ✅ Baixar as imagens Docker necessárias
2. ✅ Construir a imagem da aplicação
3. ✅ Iniciar o PostgreSQL
4. ✅ Aguardar o banco estar pronto (healthcheck)
5. ✅ Executar as migrations automaticamente
6. ✅ Iniciar a aplicação na porta 3000

### Criar Usuário Admin

Após o sistema estar rodando, execute o seed para criar o usuário admin:

```bash
# Executar seed dentro do container
docker compose exec app node prisma/seed-manual.js
```

**Credenciais do Admin:**
- Email: `admin@fiquerycо.com`
- Senha: `admin123`

### Comandos Úteis

```bash
# Parar os serviços
docker compose down

# Parar e remover volumes (apaga o banco de dados)
docker compose down -v

# Rebuild da aplicação após mudanças no código
docker compose up -d --build app

# Acessar o shell do container da aplicação
docker compose exec app sh

# Acessar o PostgreSQL
docker compose exec postgres psql -U postgres -d fique_ryco

# Ver status dos containers
docker compose ps

# Reiniciar apenas a aplicação
docker compose restart app
```

### Executar Migrations

As migrations são executadas automaticamente ao iniciar o container. Para executar manualmente:

```bash
docker compose exec app npx prisma migrate deploy
```

### Acessar a Aplicação

Após iniciar, a aplicação estará disponível em:

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

### Estrutura dos Serviços

#### PostgreSQL
- **Container**: `fique_ryco_db`
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: fique_ryco
- **Volume**: Dados persistidos em `postgres_data`

#### Aplicação NestJS
- **Container**: `fique_ryco_app`
- **Porta**: 3000
- **Volume**: `./uploads` montado em `/app/uploads` (persistência de imagens)
- **Network**: Conectado ao PostgreSQL via rede interna
- **Healthcheck**: Aguarda PostgreSQL estar pronto antes de iniciar

### Desenvolvimento com Docker

Para desenvolvimento, você pode usar volumes para hot-reload:

```yaml
# Adicione ao serviço app no docker-compose.yml
volumes:
  - ./src:/app/src
  - ./uploads:/app/uploads
command: npm run start:dev
```

### Troubleshooting

#### Porta 3000 já em uso
```bash
# Parar o processo que está usando a porta
lsof -ti:3000 | xargs kill -9

# Ou mudar a porta no docker-compose.yml
ports:
  - "3001:3000"
```

#### Porta 5432 já em uso
```bash
# Parar PostgreSQL local
sudo systemctl stop postgresql

# Ou mudar a porta no docker-compose.yml
ports:
  - "5433:5432"
```

#### Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está saudável
docker-compose ps

# Ver logs do banco
docker-compose logs postgres

# Reiniciar o banco
docker-compose restart postgres
```

#### Rebuild completo
```bash
# Parar tudo e remover volumes
docker compose down -v

# Rebuild e iniciar
docker compose up -d --build

# Executar seed novamente
docker compose exec app node prisma/seed-manual.js
```

### Variáveis de Ambiente

As variáveis de ambiente são configuradas diretamente no `docker-compose.yml`:

- `DATABASE_URL`: Conexão com PostgreSQL (usa hostname `postgres` internamente)
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_EXPIRATION`: Tempo de expiração do token
- `PORT`: Porta da aplicação
- `CORS_ORIGIN`: Origem permitida para CORS

**Importante**: Em produção, use um arquivo `.env` ou secrets do Docker para gerenciar variáveis sensíveis.

### Backup do Banco de Dados

```bash
# Criar backup
docker compose exec postgres pg_dump -U postgres fique_ryco > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U postgres fique_ryco < backup.sql
```

### Logs e Monitoramento

```bash
# Logs em tempo real
docker compose logs -f

# Últimas 100 linhas
docker compose logs --tail=100

# Logs de um serviço específico
docker compose logs -f app
docker compose logs -f postgres
```

## Fluxo Completo de Uso

```bash
# 1. Iniciar tudo
docker compose up -d

# 2. Aguardar inicialização (cerca de 30 segundos)
docker compose logs -f app

# 3. Criar usuário admin
docker compose exec app node prisma/seed-manual.js

# 4. Testar a API
curl http://localhost:3000/api

# 5. Quando terminar
docker compose down
```

Pronto! Agora você pode rodar todo o sistema com um único comando: `docker compose up -d` 🐳
