const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('unirse-a-llamada', () => {
        // Buscamos si hay otra persona conectada en la sala
        const clientesEnSala = Array.from(io.sockets.adapter.rooms.get('sala-video') || []);
        
        if (clientesEnSala.length === 0) {
            // Si eres el primero, te unes y esperas
            socket.join('sala-video');
            console.log('Primer usuario esperando en la sala:', socket.id);
        } else if (clientesEnSala.length === 1) {
            // Si ya hay uno esperando, te unes y le avisamos al primero que inicie la oferta
            socket.join('sala-video');
            console.log('Segundo usuario unido, conectando con:', clientesEnSala[0]);
            io.to(clientesEnSala[0]).emit('crear-oferta');
        } else {
            // Si ya hay 2 personas, los mandamos a otra sala o avisas que está ocupado
            socket.join('sala-video');
        }
    });

    socket.on('offer', (offer) => {
        socket.broadcast.to('sala-video').emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.to('sala-video').emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.to('sala-video').emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});