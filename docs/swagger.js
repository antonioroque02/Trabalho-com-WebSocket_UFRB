import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'API de Biblioteca',
            version: '1.0.0',
            description: 'API REST para gerenciamento de livros, autores e generos.'
        },
        servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
        components: {
            schemas: {
                LivroEntrada: {
                    type: 'object',
                    required: ['titulo', 'autor'],
                    properties: {
                        titulo: { type: 'string', maxLength: 200, example: 'Dom Casmurro' },
                        autor: { type: 'string', maxLength: 100, example: 'Machado de Assis' },
                        isbn: { type: 'string', maxLength: 20, nullable: true, example: '9788508058859' },
                        ano: { type: 'integer', minimum: 1000, example: 1899 },
                        generoId: { type: 'integer', minimum: 1, nullable: true, example: 1 }
                    }
                },
                Livro: {
                    allOf: [
                        { $ref: '#/components/schemas/LivroEntrada' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', readOnly: true, example: 1 },
                                exemplares: { type: 'integer', example: 1 },
                                criadoEm: { type: 'string', format: 'date-time', readOnly: true },
                                atualizadoEm: { type: 'string', format: 'date-time', readOnly: true }
                            }
                        }
                    ]
                },
                Paginacao: {
                    type: 'object',
                    properties: {
                        pagina: { type: 'integer', example: 1 },
                        limite: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 30 },
                        totalPaginas: { type: 'integer', example: 3 }
                    }
                },
                ListaLivros: {
                    type: 'object',
                    properties: {
                        dados: { type: 'array', items: { $ref: '#/components/schemas/Livro' } },
                        paginacao: { $ref: '#/components/schemas/Paginacao' }
                    }
                },
                Erro: {
                    type: 'object',
                    properties: { message: { type: 'string', example: 'Livro nao encontrado' } }
                }
            }
        },
        paths: {
            '/livros': {
                get: {
                    summary: 'Lista livros',
                    parameters: [
                        { name: 'titulo', in: 'query', schema: { type: 'string' } },
                        { name: 'genero', in: 'query', schema: { type: 'string' } },
                        { name: 'pagina', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limite', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'ordenar', in: 'query', schema: { type: 'string', enum: ['id', 'titulo', 'ano', 'criadoEm', 'atualizadoEm'], default: 'titulo' } },
                        { name: 'direcao', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
                    ],
                    responses: { 200: { description: 'Lista paginada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListaLivros' } } } }, 400: { description: 'Parametros invalidos' } }
                },
                post: {
                    summary: 'Cria um livro',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LivroEntrada' } } } },
                    responses: { 201: { description: 'Livro criado' }, 400: { description: 'Dados invalidos' }, 409: { description: 'ISBN duplicado' } }
                }
            },
            '/livros/{id}': {
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } }],
                get: { summary: 'Busca um livro por ID', responses: { 200: { description: 'Livro encontrado' }, 400: { description: 'ID invalido' }, 404: { description: 'Livro nao encontrado' } } },
                put: { summary: 'Atualiza um livro', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LivroEntrada' } } } }, responses: { 200: { description: 'Livro atualizado' }, 400: { description: 'Dados invalidos' }, 404: { description: 'Livro nao encontrado' } } },
                delete: { summary: 'Remove um livro', responses: { 204: { description: 'Livro removido' }, 404: { description: 'Livro nao encontrado' } } }
            }
        }
    },
    apis: []
});

export default swaggerSpec;
