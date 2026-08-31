import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
let faceLandmarker = null;
let webcamRunning = false;
let videoElement = null;

async function iniciarHeadTracking() {
    console.log("Iniciando sistema de seguimiento de cabeza...");
    
    try {
        // 1. Cargar el modelo de IA de MediaPipe
        const filesetResolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: false,
            runningMode: "VIDEO",
            numFaces: 1
        });
        
        console.log("Modelo de MediaPipe cargado correctamente.");

        // 2. Crear elemento de video oculto para procesar la cámara
        videoElement = document.createElement('video');
        videoElement.setAttribute('autoplay', '');
        videoElement.setAttribute('playsinline', '');
        videoElement.style.display = 'none'; // Se queda oculto, solo procesa por detrás
        document.body.appendChild(videoElement);

        // 3. Encender la cámara web
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoElement.srcObject = stream;
        
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            webcamRunning = true;
            console.log("Cámara web activa para seguimiento.");
            alert("¡Control por movimientos de cabeza activado! Mueve tu cabeza suavemente hacia arriba o abajo para hacer scroll.");
            predecirMovimiento();
        };

    } catch (error) {
        console.error("Error al iniciar el seguimiento de cabeza:", error);
        alert("No se pudo iniciar la cámara o cargar el modelo. Revisa los permisos de tu navegador.");
    }
}

let ultimaPosicionY = 0;

async function predecirMovimiento() {
    if (!webcamRunning || !faceLandmarker || !videoElement) return;

    if (videoElement.readyState >= 2) {
        let startTimeMs = performance.now();
        const results = faceLandmarker.detectForVideo(videoElement, startTimeMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const nariz = landmarks[1]; // Punto de la nariz
            const y = nariz.y; // Posición vertical (0.0 arriba, 1.0 abajo)

            const diferenciaY = y - ultimaPosicionY;

            // Sensibilidad al movimiento vertical de la cabeza
            if (Math.abs(diferenciaY) > 0.015) {
                if (diferenciaY > 0.02) {
                    window.scrollBy({ top: 60, behavior: 'smooth' }); // Mover hacia abajo
                } else if (diferenciaY < -0.02) {
                    window.scrollBy({ top: -60, behavior: 'smooth' }); // Mover hacia arriba
                }
            }
            ultimaPosicionY = y;
        }
    }

    requestAnimationFrame(predecirMovimiento);
}

// Vincular directamente al botón de accesibilidad cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    const botonActivar = document.getElementById('activarHeadTracking');
    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            if (!webcamRunning) {
                iniciarHeadTracking();
            } else {
                alert("El control por cabeza ya está activo.");
            }
        });
    } else {
        console.warn("No se encontró el botón con id 'activarHeadTracking' en esta página.");
    }
});