# Documento de Requisitos - Fique Ryco

## Introdução

O "Fique Ryco" é um sistema de rifas online que permite administradores gerenciarem rifas e clientes comprarem bilhetes. O sistema é um MVP focado em funcionalidade essencial, código limpo e manutenível, utilizando NestJS, Prisma ORM e PostgreSQL/MySQL.

## Glossário

- **Sistema**: O sistema Fique Ryco
- **Admin**: Usuário administrador que gerencia rifas
- **Cliente**: Usuário que compra bilhetes de rifas
- **Rifa**: Sorteio com bilhetes numerados que podem ser adquiridos
- **Bilhete**: Número individual de uma rifa que pode ser comprado
- **CPF**: Cadastro de Pessoa Física, identificador único do cliente
- **JWT**: JSON Web Token, mecanismo de autenticação

## Requisitos

### Requisito 1: Autenticação de Usuários

**User Story:** Como um usuário do sistema, eu quero fazer login com minhas credenciais, para que eu possa acessar funcionalidades específicas do meu tipo de conta.

#### Critérios de Aceitação

1. QUANDO um usuário fornece credenciais válidas, O Sistema DEVE autenticar o usuário e retornar um token JWT
2. QUANDO um usuário fornece credenciais inválidas, O Sistema DEVE rejeitar a autenticação e retornar uma mensagem de erro
3. QUANDO um token JWT válido é fornecido, O Sistema DEVE autorizar o acesso às rotas protegidas
4. QUANDO um token JWT inválido ou expirado é fornecido, O Sistema DEVE negar o acesso e retornar erro de autenticação
5. O Sistema DEVE diferenciar entre dois tipos de usuário: Admin e Cliente

### Requisito 2: Cadastro de Clientes

**User Story:** Como um cliente, eu quero me cadastrar no sistema usando meu CPF, para que eu possa comprar bilhetes de rifas.

#### Critérios de Aceitação

1. QUANDO um cliente fornece dados de cadastro válidos com CPF único, O Sistema DEVE criar uma nova conta de cliente
2. QUANDO um cliente tenta se cadastrar com um CPF já existente, O Sistema DEVE rejeitar o cadastro e retornar mensagem de erro
3. QUANDO um cliente fornece um CPF inválido, O Sistema DEVE rejeitar o cadastro e retornar mensagem de erro
4. O Sistema DEVE armazenar o CPF como identificador principal do cliente
5. O Sistema DEVE armazenar nome, email e senha do cliente

### Requisito 3: Gerenciamento de Rifas pelo Admin

**User Story:** Como um admin, eu quero criar, editar, visualizar e excluir rifas, para que eu possa gerenciar os sorteios disponíveis no sistema.

#### Critérios de Aceitação

1. QUANDO um admin cria uma rifa com dados válidos, O Sistema DEVE armazenar a rifa com título, descrição, data de encerramento, valor da ação, número máximo de cotas e foto
2. QUANDO um admin atualiza uma rifa existente, O Sistema DEVE modificar os dados da rifa mantendo sua integridade
3. QUANDO um admin solicita a lista de rifas, O Sistema DEVE retornar todas as rifas cadastradas
4. QUANDO um admin exclui uma rifa, O Sistema DEVE remover a rifa do sistema
5. QUANDO um admin faz upload de uma foto, O Sistema DEVE armazenar a imagem no sistema de arquivos local
6. O Sistema DEVE permitir que o campo "ganhador" seja opcional e preenchido após o sorteio
7. O Sistema DEVE validar que o número máximo de cotas seja um valor positivo maior que zero

### Requisito 4: Visualização de Rifas pelo Cliente

**User Story:** Como um cliente, eu quero visualizar todas as rifas disponíveis, para que eu possa escolher quais bilhetes comprar.

#### Critérios de Aceitação

1. QUANDO um cliente autenticado solicita a lista de rifas, O Sistema DEVE retornar todas as rifas ativas
2. QUANDO uma rifa é exibida, O Sistema DEVE mostrar título, descrição, data de encerramento, valor da ação e foto
3. QUANDO uma rifa está encerrada, O Sistema DEVE indicar que ela não está mais disponível para compra
4. O Sistema DEVE ordenar as rifas por data de encerramento

### Requisito 5: Visualização de Disponibilidade de Cotas

**User Story:** Como um cliente, eu quero visualizar quantas cotas ainda estão disponíveis em uma rifa, para que eu possa saber se ainda posso participar.

#### Critérios de Aceitação

1. QUANDO uma rifa é exibida, O Sistema DEVE mostrar o número total de cotas e quantas já foram vendidas
2. QUANDO uma rifa atinge o número máximo de cotas vendidas, O Sistema DEVE indicar que a rifa está esgotada
3. O Sistema DEVE calcular o número de cotas disponíveis subtraindo o número de bilhetes vendidos do número máximo de cotas

### Requisito 6: Compra de Bilhetes

**User Story:** Como um cliente, eu quero comprar bilhetes de rifas, para que eu possa participar dos sorteios.

#### Critérios de Aceitação

1. QUANDO um cliente compra um bilhete de uma rifa ativa, O Sistema DEVE gerar um número aleatório único e registrar a compra associando o cliente ao bilhete
2. QUANDO um cliente tenta comprar um bilhete de uma rifa encerrada, O Sistema DEVE rejeitar a compra e retornar mensagem de erro
3. QUANDO um cliente tenta comprar um bilhete de uma rifa que atingiu o número máximo de cotas, O Sistema DEVE rejeitar a compra e retornar mensagem de erro
4. QUANDO um número de bilhete é gerado, O Sistema DEVE garantir que este número não foi vendido anteriormente para aquela rifa
5. QUANDO um cliente tenta comprar um bilhete com número já vendido, O Sistema DEVE rejeitar a compra e gerar um novo número disponível
6. O Sistema DEVE armazenar a data e hora da compra
7. O Sistema DEVE associar o bilhete ao CPF do cliente comprador
8. O Sistema DEVE permitir que um cliente compre múltiplos bilhetes da mesma rifa, cada um com número único
9. O Sistema DEVE gerar números de bilhetes no intervalo de 1 até o número máximo de cotas da rifa

### Requisito 7: Controle de Concorrência na Compra de Bilhetes

**User Story:** Como o sistema, eu quero garantir que cada número de bilhete seja vendido apenas uma vez por rifa, para que não haja conflitos quando milhares de clientes tentarem comprar bilhetes simultaneamente.

#### Critérios de Aceitação

1. QUANDO múltiplos clientes compram bilhetes da mesma rifa simultaneamente, O Sistema DEVE garantir que cada cliente receba um número de bilhete único e diferente
2. QUANDO um número de bilhete é gerado, O Sistema DEVE verificar atomicamente se o número já foi vendido antes de confirmar a compra
3. O Sistema DEVE utilizar transações de banco de dados e constraints de unicidade para evitar duplicação de números de bilhetes
4. QUANDO milhares de compras ocorrem simultaneamente, O Sistema DEVE processar cada compra de forma isolada garantindo números únicos
5. O Sistema DEVE garantir que a geração de números aleatórios e a verificação de disponibilidade sejam operações atômicas
6. QUANDO uma tentativa de compra falha devido a número duplicado, O Sistema DEVE automaticamente tentar gerar um novo número disponível
7. O Sistema DEVE prevenir deadlocks e race conditions no processo de compra de bilhetes

### Requisito 8: Visualização de Compras do Cliente

**User Story:** Como um cliente, eu quero visualizar todas as rifas que comprei, para que eu possa acompanhar minhas participações.

#### Critérios de Aceitação

1. QUANDO um cliente autenticado solicita suas compras, O Sistema DEVE retornar todas as rifas nas quais ele possui bilhetes
2. QUANDO uma compra é exibida, O Sistema DEVE mostrar os números dos bilhetes adquiridos
3. QUANDO uma compra é exibida, O Sistema DEVE mostrar os detalhes da rifa associada
4. O Sistema DEVE ordenar as compras por data de aquisição

### Requisito 9: Visualização de Ganhadores

**User Story:** Como um cliente, eu quero ver os ganhadores de rifas encerradas, para que eu possa verificar os resultados dos sorteios.

#### Critérios de Aceitação

1. QUANDO um cliente solicita a lista de ganhadores, O Sistema DEVE retornar todas as rifas encerradas que possuem ganhador definido
2. QUANDO uma rifa com ganhador é exibida, O Sistema DEVE mostrar o título da rifa e os dados do ganhador
3. QUANDO uma rifa encerrada não possui ganhador definido, O Sistema DEVE indicar que o sorteio ainda não foi realizado
4. O Sistema DEVE ordenar os resultados por data de encerramento

### Requisito 10: Controle de Acesso por Tipo de Usuário

**User Story:** Como o sistema, eu quero garantir que apenas usuários autorizados acessem funcionalidades específicas, para que a segurança e integridade dos dados sejam mantidas.

#### Critérios de Aceitação

1. QUANDO um Cliente tenta acessar rotas administrativas, O Sistema DEVE negar o acesso e retornar erro de autorização
2. QUANDO um Admin tenta acessar rotas administrativas, O Sistema DEVE permitir o acesso
3. QUANDO um usuário não autenticado tenta acessar rotas protegidas, O Sistema DEVE negar o acesso e retornar erro de autenticação
4. O Sistema DEVE validar o tipo de usuário através do token JWT
5. O Sistema DEVE proteger todas as rotas de gerenciamento de rifas para acesso exclusivo de Admin

### Requisito 11: Armazenamento de Imagens

**User Story:** Como um admin, eu quero fazer upload de fotos das rifas, para que os clientes possam visualizar os prêmios.

#### Critérios de Aceitação

1. QUANDO um admin faz upload de uma imagem válida, O Sistema DEVE armazenar o arquivo no sistema de arquivos local
2. QUANDO um admin faz upload de um arquivo inválido, O Sistema DEVE rejeitar o upload e retornar mensagem de erro
3. O Sistema DEVE gerar um nome único para cada arquivo armazenado
4. O Sistema DEVE retornar a URL ou caminho da imagem após o upload bem-sucedido
5. QUANDO uma rifa é excluída, O Sistema DEVE remover a imagem associada do sistema de arquivos

### Requisito 12: Validação de Dados

**User Story:** Como o sistema, eu quero validar todos os dados de entrada, para que a integridade dos dados seja mantida.

#### Critérios de Aceitação

1. QUANDO dados inválidos são fornecidos em qualquer requisição, O Sistema DEVE rejeitar a requisição e retornar mensagens de erro descritivas
2. O Sistema DEVE validar formato de CPF
3. O Sistema DEVE validar formato de email
4. O Sistema DEVE validar que datas de encerramento sejam futuras ao criar rifas
5. O Sistema DEVE validar que valores de ação sejam positivos
6. QUANDO campos obrigatórios estão ausentes, O Sistema DEVE retornar erro indicando os campos faltantes
