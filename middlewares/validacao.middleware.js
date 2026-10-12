export const validar = (schema, origem = "body") => {
    return (req, res, next) => {
        const resultado = schema.safeParse(req[origem]);
        if (!resultado.success) {
            return res.status(400).json({
                erros: resultado.error.issues.map((issue) => ({
                    campo: issue.path.join("."),
                    mensagem: issue.message,
                })),
            });
        }
        // Em Express 5, req.query e somente leitura. Mantemos a consulta
        // convertida separadamente para que pagina e limite sejam numeros.
        if (origem === "query") {
            req.queryValidada = resultado.data;
        } else {
            req[origem] = resultado.data;
        }
        next();
    }
};
