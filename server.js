import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { registrarHandlers } from './notifications/handlers.js';

const servidor = http.createServer(app);
const porta = process.env.PORT || 5000;
const io = new Server(servidor, {
    cors: {
        origin: process.env.ORIGEM_PERMITIDA || '*'
    }
});

registrarHandlers(io);

servidor.listen(porta, () => {
    console.log(`API REST e WebSocket no ar em http://localhost:${porta}`);
});
