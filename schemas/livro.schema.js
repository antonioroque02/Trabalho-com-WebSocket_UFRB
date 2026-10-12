import { z } from 'zod';

const anoAtual = new Date().getFullYear();

const dadosDoLivro = {
    titulo: z.string().trim().min(1, { message: "O titulo e obrigatorio" }).max(200),
    autor: z.string().trim().min(1, { message: "O autor e obrigatorio" }).max(100),
    isbn: z.string().trim().max(20).optional().nullable(),
    ano: z.coerce.number().int({ message: "O ano deve ser inteiro" }).min(1000).max(anoAtual).optional(),
    generoId: z.coerce.number().int().positive().optional().nullable(),
};

export const criarLivroSchema = z.object(dadosDoLivro);
export const atualizarLivroSchema = z.object(dadosDoLivro).partial().refine(
    (dados) => Object.keys(dados).length > 0,
    { message: "Informe ao menos um campo para atualizar" }
);
export const idSchema = z.object({
    id: z.coerce.number().int().positive({ message: "O id deve ser um inteiro positivo" }),
});
export const consultaLivrosSchema = z.object({
    genero: z.string().trim().min(1).max(60).optional(),
    titulo: z.string().trim().min(1).max(200).optional(),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().min(1).max(100).default(10),
    ordenar: z.enum(["id", "titulo", "ano", "criadoEm", "atualizadoEm"]).default("titulo"),
    direcao: z.enum(["asc", "desc"]).default("asc"),
});

export const livroSchema = z.object({
    titulo: z
        .string()
        .min(1, { message: "O título é obrigatório" })
        .max(200, { message: "O título deve ter no máximo 200 caracteres" }),
    autor: z
        .string()
        .min(1, { message: "O autor é obrigatório" })
        .max(100, { message: "O autor deve ter no máximo 100 caracteres" }),
    ano: z
        .number()
        .min(1000, { message: "O ano deve ser maior ou igual a 1000" })
        .max(2026, { message: "O ano deve ser menor ou igual a 2026" }),
});
