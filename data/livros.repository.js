import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const livrosRepository = {
    async listar({ genero, titulo, pagina = 1, limite = 10, ordenar = 'titulo', direcao = 'asc' }) {
        const where = {
            ...(genero && { genero: { is: { nome: { equals: genero, mode: 'insensitive' } } } }),
            ...(titulo && { titulo: { contains: titulo, mode: 'insensitive' } })
        };

        const itensPorPagina = parseInt(limite, 10);
        const paginaAtual = parseInt(pagina, 10);

        const [dados, total] = await prisma.$transaction([
            prisma.livro.findMany({
                where,
                include: {
                    genero: true,
                    autores: { include: { autor: true } }
                },
                orderBy: { [ordenar]: direcao },
                skip: (paginaAtual - 1) * itensPorPagina,
                take: itensPorPagina
            }),
            prisma.livro.count({ where })
        ]);

        return {
            dados,
            paginacao: {
                pagina: paginaAtual,
                limite: itensPorPagina,
                total,
                totalPaginas: Math.ceil(total / itensPorPagina)
            }
        };
    },
    buscarPorId: async (id) => {
        return prisma.livro.findUnique({
            where: { id },
            include: {
                genero: true,
                autores: { include: { autor: true } },
                emprestimos: {
                    where: { dataDevolucao: null },
                    include: { estudante: { select: { nome: true, matricula: true } } }
                }
            }
        });
    },
    async criar({ titulo, autor, isbn, ano, generoId }) {
        const autorExistente = await prisma.autor.findFirst({
            where: { nome: { equals: autor, mode: 'insensitive' } },
            select: { id: true }
        });
        return prisma.livro.create({
            data: {
                titulo,
                isbn: isbn || null,
                ano,
                generoId,
                autores: {
                    create: {
                        autor: autorExistente
                            ? { connect: { id: autorExistente.id } }
                            : { create: { nome: autor } }
                    }
                }
            },
            include: { genero: true, autores: { include: { autor: true } } }
        });
    },
    atualizar: async (id, { autor, ...dadosDoLivro }) => {
        const data = { ...dadosDoLivro };
        if (autor !== undefined) {
            const autorExistente = await prisma.autor.findFirst({
                where: { nome: { equals: autor, mode: 'insensitive' } },
                select: { id: true }
            });
            data.autores = {
                deleteMany: {},
                create: {
                    autor: autorExistente
                        ? { connect: { id: autorExistente.id } }
                        : { create: { nome: autor } }
                }
            };
        }
        return prisma.livro.update({
            where: { id },
            data,
            include: { genero: true, autores: { include: { autor: true } } }
        });
    },
    remover: async (id) => {
        return prisma.livro.delete({ where: { id } });
    }
};
