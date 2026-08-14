const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir todos los archivos estáticos (HTML, CSS, JS) de tu proyecto
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Reenviar la oferta de WebRTC al otro usuario
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    // Reenviar la respuesta de WebRTC
    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    // Reenviar candidatos ICE para establecer la ruta de red
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
})
