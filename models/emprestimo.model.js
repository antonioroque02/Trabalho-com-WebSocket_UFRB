export class Emprestimo {
    constructor({ livro, estudante, dataRetirada, dataPrevista, dataDevolucao = null }) {
        this.livro = livro;
        this.estudante = estudante;
        this.dataRetirada = dataRetirada;
        this.dataPrevista = dataPrevista;
        this.dataDevolucao = dataDevolucao;
    }
}   