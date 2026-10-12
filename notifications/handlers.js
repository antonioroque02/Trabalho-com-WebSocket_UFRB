let proximoUsuarioId = 1;
let proximaMensagemId = 1;
const mensagens = [];

const salvarMensagem = async ({ salaId, texto, autor }) => {
    const mensagem = {
        id: proximaMensagemId++,
        salaId,
        texto,
        autor,
        criadaEm: new Date().toISOString()
    };
    mensagens.push(mensagem);
    return mensagem;
};

export const registrarHandlers = (io) => {
    io.use((socket, next) => {
        socket.data.usuario = { id: proximoUsuarioId++, nome: socket.handshake.query.nome || 'Anônimo' };
        next();
    });

    io.on('connection', (socket) => {
        console.log(`Conectado: ${socket.data.usuario.nome} (${socket.id})`);

        socket.on('entrar-na-sala', async ({ salaId } = {}) => {
            if ((typeof salaId !== 'string' && typeof salaId !== 'number') || !String(salaId).trim()) {
                socket.emit('erro-chat', { mensagem: 'Informe um salaId válido.' });
                return;
            }

            const salaIdNormalizado = String(salaId).trim();
            const sala = `sala:${salaIdNormalizado}`;

            if (socket.rooms.has(sala)) {
                return;
            }

            // Captura quem já está na sala antes de adicionar este participante.
            const socketsExistentes = await io.in(sala).fetchSockets();
            const participantes = socketsExistentes.map((participante) => ({
                id: participante.data.usuario.id,
                nome: participante.data.usuario.nome
            }));

            await socket.join(sala);
            socket.emit('participantes-na-sala', { salaId: salaIdNormalizado, participantes });

            // Todos na sala recebem o aviso, inclusive quem acabou de entrar.
            io.to(sala).emit('participante-entrou', {
                id: socket.data.usuario.id,
                usuario: socket.data.usuario.nome,
                salaId: salaIdNormalizado
            });
            console.log(`${socket.data.usuario.nome} entrou na sala ${salaIdNormalizado}`);
        });

        socket.on('mensagem', async ({ salaId, texto } = {}) => {
            if ((typeof salaId !== 'string' && typeof salaId !== 'number') || !String(salaId).trim()) {
                socket.emit('erro-chat', { mensagem: 'Informe um salaId válido.' });
                return;
            }

            if (typeof texto !== 'string' || !texto.trim()) {
                socket.emit('erro-chat', { mensagem: 'A mensagem não pode estar vazia.' });
                return;
            }

            const salaIdNormalizado = String(salaId).trim();
            const sala = `sala:${salaIdNormalizado}`;
            if (!socket.rooms.has(sala)) {
                socket.emit('erro-chat', { mensagem: `Entre na sala ${salaIdNormalizado} antes de enviar mensagens.` });
                return;
            }

            const mensagem = await salvarMensagem({
                salaId: salaIdNormalizado,
                texto: texto.trim(),
                autor: {
                    id: socket.data.usuario.id,
                    nome: socket.data.usuario.nome
                }
            });
            io.to(sala).emit('nova-mensagem', mensagem);
            console.log(`Mensagem de ${socket.data.usuario.nome} enviada na sala ${salaIdNormalizado}`);
        });

        socket.on('disconnecting', (motivo) => {
            for (const sala of socket.rooms) {
                if (!sala.startsWith('sala:')) continue;

                const salaId = sala.slice('sala:'.length);
                socket.to(sala).emit('participante-saiu', {
                    id: socket.data.usuario.id,
                    usuario: socket.data.usuario.nome,
                    salaId,
                    motivo
                });
            }
        });

        socket.on('disconnect', (motivo) => {
            console.log(`Saiu: ${socket.id} (${motivo})`);
        });
    });
}
