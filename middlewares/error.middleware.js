export function tratarErros(erro, req, res, next) {
    console.error(erro);

    if (res.headersSent) return next(erro);

    if (erro.status) {
        return res.status(erro.status).json({ message: erro.message });
    }

    if (erro.code === 'P2025') {
        return res.status(404).json({ message: 'Registro não encontrado' });
    }
    if (erro.code === 'P2002') {
        return res.status(409).json({ message: 'Já existe um registro com esse valor único' });
    }
    if (erro.code === 'P2003') {
        return res.status(400).json({ message: 'O relacionamento informado não existe' });
    }

    return res.status(500).json({ message: 'Erro interno do servidor' });
}