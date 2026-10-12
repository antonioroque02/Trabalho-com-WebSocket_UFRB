import { livrosRepository } from "../data/livros.repository.js"

export const livrosController = {
    listar: async (req, res) => {
        const livros = await livrosRepository.listar(req.queryValidada)
        res.json(livros)
    },
    buscarPorId: async (req, res) => {
        const { id } = req.params
        const livro = await livrosRepository.buscarPorId(id)
        if (livro) {
            res.json(livro)
        } else {
            res.status(404).json({ message: "Livro não encontrado" })
        }
    },
    criar: async (req, res) => {
        const livroSemId = req.body
        const livroComId = await livrosRepository.criar(livroSemId)
        res.status(201).json(livroComId)
    },
    atualizar: async (req, res) => {
        const { id } = req.params
        const dadosAtualizadosDoLivro = req.body
        const livroAtualizado = await livrosRepository.atualizar(id, dadosAtualizadosDoLivro)
        if (livroAtualizado) {
            res.json(livroAtualizado)
        } else {
            res.status(404).json({ message: "Livro não encontrado" })
        }
    },
    remover: async (req, res) => {
        const { id } = req.params
        const sucesso = await livrosRepository.remover(id)
        if (sucesso) {
            res.json({ message: "Livro removido com sucesso" })
        } else {
            res.status(404).json({ message: "Livro não encontrado" })
        }
    }
};
