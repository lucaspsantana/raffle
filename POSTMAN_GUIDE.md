# Guia de Testes com Postman - Fique Ryco API

## Importar no Postman

1. Abra o Postman
2. Clique em **Import** no canto superior esquerdo
3. Arraste os arquivos ou clique em **Upload Files**:
   - `Fique-Ryco.postman_collection.json`
   - `Fique-Ryco.postman_environment.json`
4. Selecione o environment **Fique Ryco - Local** no dropdown superior direito

## Preparar o Ambiente

Antes de testar, certifique-se de que:

```bash
# 1. Banco de dados está rodando
docker-compose up -d

# 2. Migrations foram aplicadas
npx prisma migrate dev

# 3. Seed do Admin foi executado
npm run seed

# 4. Servidor está rodando
npm run start:dev
```

## Fluxo de Testes Recomendado

### 1. Autenticação como Admin

**Request**: `Auth > Login Admin`

```json
{
  "email": "admin@fiquerycо.com",
  "password": "admin123"
}
```

O token JWT será salvo automaticamente na variável `{{jwt_token}}`.

### 2. Criar uma Rifa (Admin)

**Request**: `Raffles > Create Raffle (Admin)`

```json
{
  "title": "iPhone 15 Pro Max",
  "description": "Concorra a um iPhone 15 Pro Max 256GB na cor azul titânio!",
  "closingDate": "2026-12-31T23:59:59Z",
  "ticketPrice": 25.00,
  "maxTickets": 1000,
  "imageUrl": "/uploads/iphone.jpg"
}
```

O ID da rifa será salvo automaticamente em `{{raffle_id}}`.

### 3. Listar Rifas Ativas

**Request**: `Raffles > Get Active Raffles`

Retorna todas as rifas com data de encerramento futura.

### 4. Cadastrar um Cliente

**Request**: `Auth > Register Client`

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "cpf": "12345678909"
}
```

**CPFs válidos para teste:**
- `12345678909`
- `11144477735`
- `52998224725`

### 5. Login como Cliente

**Request**: `Auth > Login Client`

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

O token do cliente substituirá o token do admin em `{{jwt_token}}`.

### 6. Comprar um Bilhete (Cliente)

**Request**: `Tickets > Purchase Ticket (Client)`

```json
{
  "raffleId": "{{raffle_id}}"
}
```

O sistema gerará automaticamente um número único aleatório entre 1 e maxTickets.

### 7. Ver Meus Bilhetes (Cliente)

**Request**: `Tickets > Get My Tickets (Client)`

Retorna todos os bilhetes comprados pelo cliente autenticado.

### 8. Login como Admin Novamente

Para executar operações administrativas, faça login como admin novamente:

**Request**: `Auth > Login Admin`

### 9. Ver Bilhetes de uma Rifa (Admin)

**Request**: `Tickets > Get Raffle Tickets (Admin)`

Lista todos os bilhetes vendidos de uma rifa específica com dados dos compradores.

### 10. Definir Ganhador (Admin)

**Request**: `Raffles > Set Winner (Admin)`

```json
{
  "winnerId": "{{client_id}}"
}
```

### 11. Upload de Imagem (Admin)

**Request**: `Uploads > Upload Image (Admin)`

1. Selecione o campo `file` no body
2. Clique em **Select Files**
3. Escolha uma imagem (jpg, jpeg, png ou gif)
4. Envie a requisição

A URL da imagem será salva em `{{image_url}}`.

## Variáveis de Ambiente

A collection usa as seguintes variáveis (gerenciadas automaticamente):

- `base_url`: URL base da API (http://localhost:3000)
- `jwt_token`: Token JWT do usuário autenticado
- `admin_id`: ID do usuário admin
- `client_id`: ID do cliente cadastrado
- `raffle_id`: ID da última rifa criada
- `ticket_id`: ID do último bilhete comprado
- `ticket_number`: Número do último bilhete comprado
- `image_url`: URL da última imagem enviada

## Testando Controle de Acesso

### Cliente tentando acessar rota de Admin

1. Faça login como cliente (`Auth > Login Client`)
2. Tente criar uma rifa (`Raffles > Create Raffle (Admin)`)
3. Deve retornar **403 Forbidden**

### Requisição sem autenticação

1. Remova o token do header Authorization
2. Tente acessar qualquer rota protegida
3. Deve retornar **401 Unauthorized**

## Testando Validações

### CPF Inválido

Tente cadastrar com CPF inválido:

```json
{
  "name": "Teste",
  "email": "teste@example.com",
  "password": "senha123",
  "cpf": "12345678900"
}
```

Deve retornar erro de validação.

### CPF Duplicado

Tente cadastrar dois clientes com o mesmo CPF. O segundo deve falhar com **409 Conflict**.

### Data de Encerramento no Passado

Tente criar rifa com data passada:

```json
{
  "title": "Rifa Teste",
  "description": "Teste",
  "closingDate": "2020-01-01T00:00:00Z",
  "ticketPrice": 10,
  "maxTickets": 100
}
```

Deve retornar erro de validação.

### Rifa Encerrada

1. Crie uma rifa com data de encerramento próxima
2. Aguarde a data passar
3. Tente comprar um bilhete
4. Deve retornar **400 Bad Request** - "This raffle is already closed"

## Testando Concorrência

Para testar a unicidade de números de bilhetes sob concorrência:

1. Use o **Postman Runner** ou **Collection Runner**
2. Selecione a request `Purchase Ticket (Client)`
3. Configure para executar 50-100 iterações
4. Execute
5. Verifique que todos os bilhetes têm números únicos usando `Get Raffle Tickets (Admin)`

## Dicas

- Os scripts de teste salvam automaticamente IDs e tokens nas variáveis de ambiente
- Use `{{variavel}}` para referenciar valores salvos
- Sempre faça login antes de testar rotas protegidas
- Alterne entre login de Admin e Cliente conforme necessário
- O Swagger UI também está disponível em http://localhost:3000/api para testes interativos

## Troubleshooting

### Token expirado
Se receber erro 401, faça login novamente para obter um novo token.

### Raffle ID não encontrado
Certifique-se de criar uma rifa primeiro e que o ID foi salvo em `{{raffle_id}}`.

### Erro de conexão
Verifique se o servidor está rodando em http://localhost:3000.

### Erro de banco de dados
Certifique-se de que o PostgreSQL está rodando e as migrations foram aplicadas.
