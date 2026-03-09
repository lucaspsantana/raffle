# Seed do Banco de Dados

Este diretório contém scripts para popular o banco de dados com dados iniciais.

## Script de Seed Manual

Devido a limitações do Prisma 7.x com a inicialização do PrismaClient, foi criado um script de seed manual que se conecta diretamente ao banco de dados PostgreSQL.

### Como Executar

```bash
# Opção 1: Executar diretamente
node prisma/seed-manual.js

# Opção 2: Usar o script npm
npm run seed
```

### O que o Script Faz

O script cria (ou atualiza) um usuário Admin padrão no banco de dados com as seguintes credenciais:

- **Email**: `admin@fiquerycо.com`
- **Senha**: `admin123`
- **Role**: `ADMIN`

### Comportamento

- Se o usuário Admin já existir, o script irá **atualizar** a senha e os dados
- Se o usuário não existir, o script irá **criar** um novo usuário Admin
- A senha é automaticamente hasheada usando bcrypt antes de ser armazenada

### Requisitos

- Banco de dados PostgreSQL rodando
- Variável de ambiente `DATABASE_URL` configurada no arquivo `.env`
- Migrations do Prisma aplicadas (`npx prisma migrate dev`)

### Troubleshooting

Se você encontrar erros:

1. **Erro de conexão**: Verifique se o banco de dados está rodando e se a `DATABASE_URL` está correta
2. **Erro de tabela não encontrada**: Execute as migrations primeiro com `npx prisma migrate dev`
3. **Erro de módulo não encontrado**: Execute `npm install` para instalar as dependências

### Arquivos

- `seed-manual.js`: Script principal de seed que funciona diretamente com PostgreSQL
- `seed.ts`: Script TypeScript (não funcional devido a limitações do Prisma 7.x)
- `seed.js`: Script JavaScript (não funcional devido a limitações do Prisma 7.x)

### Nota sobre Prisma 7.x

O Prisma 7.x introduziu mudanças na arquitetura do PrismaClient que requerem um `adapter` ou `accelerateUrl` para inicialização. Por isso, foi necessário criar um script de seed manual que se conecta diretamente ao banco de dados usando o driver `postgres`.
