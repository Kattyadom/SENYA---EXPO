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
        
        // Una vez lista nuestra cámara, iniciamos la conexión P2P
        iniciarConexionPeer();
    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        alert("Por favor, permite el acceso a tu cámara y micrófono para usar la videollamada.");
    }
}

async function iniciarConexionPeer() {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    if (remoteVideo) remoteVideo.srcObject = remoteStream;

    // Agregar nuestros streams locales al PeerConnection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Recibir streams del otro usuario
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
        // Ocultar el aviso de "Waiting for video..." cuando entra el video real
        if (remotePlaceholder) remotePlaceholder.style.display = 'none';
        iniciarCronometro();
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    // Si somos el primer usuario en entrar, creamos la oferta de llamada
    socket.on('connect', async () => {
        // Creamos la oferta para conectar con quien se uniera después
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', offer);
    });
}

// Escuchar ofertas y respuestas de otros usuarios conectados en la red
socket.on('offer', async (offer) => {
    if (!peerConnection) return;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    if (peerConnection && !peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
});

socket.on('ice-candidate', async (candidate) => {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('Error al añadir ICE candidate', e);
        }
    }
});

// Control de Micrófono
document.getElementById('micButton')?.addEventListener('click', () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('micButton').style.background = audioTrack.enabled ? '#ecf5ff' : '#f6639a';
        document.getElementById('micButton').style.color = audioTrack.enabled ? '#2563eb' : '#ffffff';
    }
});

// Control de Cámara
document.getElementById('cameraButton')?.addEventListener('click', () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById('cameraButton').style.background = videoTrack.enabled ? '#ecf5ff' : '#f6639a';
        document.getElementById('cameraButton').style.color = videoTrack.enabled ? '#2563eb' : '#ffffff';
    }
});

// Iniciar proceso al cargar
iniciarMedia();