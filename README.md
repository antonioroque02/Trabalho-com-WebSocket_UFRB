# Sistema de Biblioteca com WebSocket

Projeto acadêmico de uma API para gerenciamento de livros e empréstimos, complementada por um chat em tempo real com salas usando Socket.IO.

## Objetivos

- Disponibilizar operações REST para consultar e manter o catálogo de livros.
- Registrar empréstimos aplicando regras de disponibilidade e elegibilidade do estudante.
- Demonstrar comunicação bidirecional em tempo real com salas WebSocket.
- Persistir os dados da biblioteca em PostgreSQL usando Prisma ORM.

## Tecnologias

- Node.js com módulos ES (ESM)
- Express 5
- Socket.IO 4
- PostgreSQL
- Prisma ORM 6
- Zod para validação dos dados de entrada

## Funcionalidades

### API REST

- Listagem paginada de livros, com filtros por título e gênero e opções de ordenação.
- Consulta, criação, atualização e remoção de livros.
- Registro de empréstimo com baixa transacional da quantidade de exemplares.
- Validação de parâmetros e corpos das requisições.
- Respostas de erro para dados inválidos, registros inexistentes e conflitos de negócio.

### Chat em tempo real

- Identificação de participantes pelo nome informado na conexão.
- Entrada em salas identificadas por `salaId`.
- Avisos de entrada e saída, lista de participantes presentes e troca de mensagens.
- Validação de sala e conteúdo antes do envio das mensagens.

## Regras de empréstimo

- O prazo padrão é de 14 dias; a requisição pode escolher de 1 a 30 dias.
- Cada estudante pode ter no máximo 3 empréstimos sem devolução.
- Estudantes inativos ou com empréstimos em atraso não podem retirar novos livros.
- É necessário haver ao menos um exemplar disponível. A baixa do exemplar e o registro do empréstimo são feitos na mesma transação do banco.

## Estrutura do projeto

```text
.
├── controllers/       # Tratamento das requisições HTTP
├── data/              # Acesso ao banco de dados (repositórios Prisma)
├── docs/              # Coleção de requisições para Postman/Insomnia
├── dtos/              # Formatação de respostas
├── middlewares/       # Validação e tratamento de erros
├── models/            # Modelo e fábrica de empréstimo
├── notifications/     # Eventos e salas Socket.IO
├── prisma/            # Schema, migrations e carga de dados
├── routes/            # Rotas da API REST
├── schemas/           # Schemas Zod de entrada
├── services/          # Regras de negócio de empréstimos
├── app.js             # Configuração do Express
├── server.js          # Inicialização HTTP e Socket.IO
└── prisma.config.ts   # Configuração do Prisma
```

## Requisitos

- Node.js e npm instalados.
- PostgreSQL disponível localmente ou em um servidor acessível.
- Git para clonar o repositório.

## Instalação e execução

Na pasta clonada do projeto:

```bash
git clone https://github.com/antonioroque02/Trabalho-com-WebSocket_UFRB.git
cd Trabalho-com-WebSocket_UFRB
```

Crie o arquivo local de configuração a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell, use `Copy-Item .env.example .env`. Edite `.env` e configure uma URL válida do PostgreSQL. Exemplo:

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/biblioteca?schema=public"
PORT=5000
ORIGEM_PERMITIDA=http://localhost:3000
```

Crie previamente o banco `biblioteca` no PostgreSQL e substitua usuário e senha pelos valores do seu ambiente. Se a senha tiver caracteres especiais, codifique-os para uso em uma URL.

Instale as dependências, aplique as migrations e inicie o servidor:

```bash
npm ci
npx prisma migrate deploy
npm start
```

O cliente Prisma é gerado pelo script `postinstall` durante a instalação. Configure `DATABASE_URL` antes de executar `npm ci`, pois a configuração do Prisma lê essa variável.

Por padrão, o servidor inicia em `http://localhost:5000`. Use `PORT` para definir outra porta. `ORIGEM_PERMITIDA` controla a origem permitida pelo Socket.IO; em produção, configure a origem real do cliente em vez de `*`.

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Dados de demonstração

Depois de configurar o banco e aplicar as migrations, carregue os dados de exemplo com:

```bash
npm run db:seed
```

**Atenção:** o seed executa `TRUNCATE` nas tabelas da biblioteca antes de inserir os exemplos. Ele apaga os dados existentes nessas tabelas. Use-o apenas em um banco de demonstração ou depois de fazer backup.

## API REST

A URL base local é `http://localhost:5000`. As rotas recebem e retornam JSON.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/livros` | Lista livros com filtros, paginação e ordenação |
| `GET` | `/livros/:id` | Consulta um livro e seus dados relacionados |
| `POST` | `/livros` | Cadastra um livro |
| `PUT` | `/livros/:id` | Atualiza um ou mais campos do livro |
| `DELETE` | `/livros/:id` | Remove um livro |
| `POST` | `/emprestimos` | Registra um empréstimo |

### Listar livros

Parâmetros opcionais de consulta:

| Parâmetro | Descrição | Padrão / limites |
| --- | --- | --- |
| `titulo` | Busca parcial, sem diferenciar maiúsculas de minúsculas | — |
| `genero` | Nome exato do gênero, sem diferenciar maiúsculas de minúsculas | — |
| `pagina` | Página solicitada | `1` |
| `limite` | Itens por página | `10`, de 1 a 100 |
| `ordenar` | Campo de ordenação: `id`, `titulo`, `ano`, `criadoEm` ou `atualizadoEm` | `titulo` |
| `direcao` | Direção da ordenação: `asc` ou `desc` | `asc` |

Exemplo:

```http
GET /livros?titulo=dom&pagina=1&limite=10&ordenar=titulo&direcao=asc
```

A resposta contém `dados` e os metadados `paginacao` (`pagina`, `limite`, `total` e `totalPaginas`).

### Criar livro

`titulo` e `autor` são obrigatórios. `isbn`, `ano` e `generoId` são opcionais; o ano deve ser um inteiro entre 1000 e o ano atual.

```http
POST /livros
Content-Type: application/json

{
  "titulo": "Capitães da Areia",
  "autor": "Jorge Amado",
  "isbn": "9788535914061",
  "ano": 1937,
  "generoId": 1
}
```

O autor é associado a um cadastro existente com o mesmo nome ou criado quando ainda não existe. O gênero, quando informado, deve corresponder a um `generoId` cadastrado.

### Atualizar e remover livro

O `PUT /livros/:id` aceita os mesmos campos do cadastro, todos opcionais, mas exige ao menos um campo. `DELETE /livros/:id` remove o livro; o banco pode impedir a remoção quando houver empréstimos relacionados.

### Registrar empréstimo

```http
POST /emprestimos
Content-Type: application/json

{
  "livroId": 1,
  "estudanteId": 1,
  "dias": 14
}
```

`dias` é opcional e aceita valores inteiros de 1 a 30. Se omitido, o prazo é de 14 dias. O cadastro de estudantes e gêneros é feito pelo seed; o projeto não disponibiliza rotas REST para gerenciá-los.

### Erros HTTP

- `400`: parâmetros ou dados inválidos, ou relacionamento informado inexistente.
- `404`: livro ou estudante não encontrado.
- `409`: conflito, como ISBN duplicado ou regra de empréstimo violada.
- `500`: erro inesperado no servidor.

## WebSocket com Socket.IO

Conecte um cliente Socket.IO ao mesmo endereço e informe o nome como query da conexão. Exemplo em JavaScript, após instalar `socket.io-client` no projeto cliente:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  query: { nome: 'Ana' }
});

socket.on('connect', () => {
  socket.emit('entrar-na-sala', { salaId: 'turma-1' });
});

socket.on('participantes-na-sala', (dados) => console.log(dados));
socket.on('participante-entrou', (dados) => console.log(dados));
socket.on('nova-mensagem', (mensagem) => console.log(mensagem));
socket.on('participante-saiu', (dados) => console.log(dados));
socket.on('erro-chat', (erro) => console.error(erro));

socket.emit('mensagem', {
  salaId: 'turma-1',
  texto: 'Olá, pessoal!'
});
```

### Eventos

| Direção | Evento | Dados / finalidade |
| --- | --- | --- |
| Cliente → servidor | `entrar-na-sala` | `{ salaId }`; entra na sala e solicita os participantes atuais |
| Servidor → cliente | `participantes-na-sala` | `{ salaId, participantes }` |
| Servidor → sala | `participante-entrou` | `{ id, usuario, salaId }` |
| Cliente → servidor | `mensagem` | `{ salaId, texto }`; exige que o cliente já esteja na sala |
| Servidor → sala | `nova-mensagem` | `{ id, salaId, texto, autor, criadaEm }` |
| Servidor → sala | `participante-saiu` | `{ id, usuario, salaId, motivo }` |
| Servidor → cliente | `erro-chat` | `{ mensagem }` quando os dados ou a sequência de eventos são inválidos |

As mensagens e os identificadores de participantes são mantidos apenas na memória do processo; o histórico não é persistido e é perdido quando o servidor reinicia.

## Testes e ferramentas

A coleção inicial de requisições está em [`docs/biblioteca-api.postman_collection.json`](docs/biblioteca-api.postman_collection.json) e pode ser importada no Postman ou Insomnia. Ajuste a variável `baseUrl` para `http://localhost:5000` ao usá-la com a configuração padrão.

O script `npm test` ainda é apenas um placeholder do npm; não há suíte de testes automatizados configurada neste projeto.
