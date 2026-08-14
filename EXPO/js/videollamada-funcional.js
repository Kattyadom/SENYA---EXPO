const socket = io();

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const remotePlaceholder = document.getElementById('remotePlaceholder');

let segundosTotales = 0;
let timerInterval = null;

function iniciarCronometro() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        segundosTotales++;
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        const timerElement = document.getElementById('callTimer');
        if (timerElement) {
            timerElement.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }
    }, 1000);
}

async function iniciarMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo) localVideo.srcObject = localStream;
        
        // Avisar al servidor que ya estamos listos en la página de videollamada
        socket.emit('unirse-a-llamada');
    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        alert("Por favor, permite el acceso a tu cámara y micrófono.");
    }
}

// El servidor nos avisa que hay alguien más esperando y debemos iniciar la llamada (Oferta)
socket.on('crear-oferta', async () => {
    await crearPeerConnection();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
});

// Recibir la oferta del primer usuario
socket.on('offer', async (offer) => {
    await crearPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

// Recibir la respuesta del segundo usuario
socket.on('answer', async (answer) => {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
});

// Recibir candidatos ICE
socket.on('ice-candidate', async (candidate) => {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('Error al añadir ICE candidate', e);
        }
    }
});

async function crearPeerConnection() {
    if (peerConnection) return;
    
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    if (remoteVideo) remoteVideo.srcObject = remoteStream;

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
        if (remotePlaceholder) remotePlaceholder.style.display = 'none';
        iniciarCronometro();
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };
}

// Controles de Micrófono y Cámara
document.getElementById('micButton')?.addEventListener('click', () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('micButton').style.background = audioTrack.enabled ? '#ecf5ff' : '#f6639a';
        document.getElementById('micButton').style.color = audioTrack.enabled ? '#2563eb' : '#ffffff';
    }
});

document.getElementById('cameraButton')?.addEventListener('click', () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById('cameraButton').style.background = videoTrack.enabled ? '#ecf5ff' : '#f6639a';
        document.getElementById('cameraButton').style.color = videoTrack.enabled ? '#2563eb' : '#ffffff';
    }
});

iniciarMedia();
// Función para cerrar la llamada por completo
function terminarLlamada() {
    // 1. Detener todas las pistas de la cámara y micrófono locales (apaga la luz de la cámara)
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // 2. Cerrar la conexión WebRTC con el otro usuario
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // 3. Detener el cronómetro de la llamada
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        segundosTotales = 0;
    }

    // 4. Desconectar del servidor de Socket.io
    if (socket) {
        socket.disconnect();
    }

    // 5. Redirigir al usuario a la página de agradecimiento, inicio o historial
    window.location.href = 'finished.html'; // Cambia 'finished.html' por la página a la que quieras mandarla al colgar
}

// Escuchar el clic en el botón de colgar
document.getElementById('endCallButton')?.addEventListener('click', terminarLlamada);