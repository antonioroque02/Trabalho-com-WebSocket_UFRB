# Trabalho com WebSocket UFRB

API REST para gerenciamento de livros e empréstimos, com notificações em tempo real via WebSocket.

## Requisitos

- Node.js e npm
- PostgreSQL

## Configuração

1. Clone o repositório e entre na pasta do projeto.
2. Copie `.env.example` para `.env` e informe os dados de conexão do PostgreSQL em `DATABASE_URL`.
3. Instale as dependências com `npm ci`. A instalação gera o cliente Prisma a partir de `prisma/schema.prisma`.
4. Aplique as migrations no banco com `npx prisma migrate deploy`.
5. Inicie a aplicação com `npm start`.

O servidor usa a porta `5000` por padrão. Configure `PORT` para usar outra porta. `ORIGEM_PERMITIDA` define a origem autorizada pelo Socket.IO; o padrão `*` permite qualquer origem.

Para carregar os dados de exemplo, execute `npm run db:seed` depois de aplicar as migrations.

## Rotas

- `/livros`
- `/emprestimos`

A coleção do Postman está em `docs/biblioteca-api.postman_collection.json`.
