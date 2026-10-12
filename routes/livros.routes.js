import { Router } from "express";
import { livrosController } from '../controllers/livros.controller.js';
import { validar } from "../middlewares/validacao.middleware.js";
import {
    atualizarLivroSchema,
    consultaLivrosSchema,
    criarLivroSchema,
    idSchema,
} from "../schemas/livro.schema.js";

const router = Router();

router.get('/', validar(consultaLivrosSchema, "query"), livrosController.listar);
router.get('/:id', validar(idSchema, "params"), livrosController.buscarPorId);
router.post(
    '/',
    validar(criarLivroSchema),
    livrosController.criar);
router.put(
    '/:id',
    validar(idSchema, "params"),
    validar(atualizarLivroSchema),
    livrosController.atualizar
);
router.delete('/:id', validar(idSchema, "params"), livrosController.remover);

export default router;

