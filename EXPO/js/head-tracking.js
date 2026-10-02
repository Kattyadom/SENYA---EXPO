import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let faceLandmarker = null;
let webcamRunning = false;
let videoElement = null;
let mediaStream = null;
let ownsMediaStream = false;
let starting = false;
let startGeneration = 0;
let animationFrameId = null;
let lastVideoTime = -1;
let neutralHeadPosition = null;
const HEAD_SENSITIVITY = 3;
const CURSOR_SMOOTHING = 0.35;

let cursorElement = null;
let tiempoDetenido = 0;
let ultimoBotonBajoCursor = null;
let dwellClicked = false;
function resetDwell() {
    tiempoDetenido = 0;
    ultimoBotonBajoCursor = null;
    dwellClicked = false;
}
function updateDwell(target, now) {
    if (!target || target.disabled || target.closest('[inert], [aria-disabled="true"]')) { resetDwell(); return; }
    if (target !== ultimoBotonBajoCursor) {
        ultimoBotonBajoCursor = target;
        tiempoDetenido = now;
        dwellClicked = false;
    } else if (!dwellClicked && now - tiempoDetenido >= 1500) {
        // Require leaving the target before another activation.
        dwellClicked = true;
        target.focus?.({ preventScroll: true });
        target.click();
    }
}

async function iniciarHeadTracking(esAutoInicio = false) {
    if (starting || webcamRunning) return;
    const callVideo = document.getElementById('localVideo');
    if (callVideo && !callVideo.srcObject) {
        if (!esAutoInicio) alert('Start your call camera before enabling head control.');
        return;
    }
    starting = true;
    const generation = ++startGeneration;
    console.log("Iniciando sistema de seguimiento de cabeza...");
    lastVideoTime = -1;
    neutralHeadPosition = null;
    posXSuavizada = window.innerWidth / 2;
    posYSuavizada = window.innerHeight / 2;
    
    cursorElement = document.getElementById('headCursor');
    if (!cursorElement) {
        cursorElement = document.createElement('div');
        cursorElement.id = 'headCursor';
        cursorElement.style.cssText = "position: fixed; width: 20px; height: 20px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; pointer-events: none; z-index: 99999; display: none; transform: translate(-50%, -50%); box-shadow: 0 0 10px rgba(0,0,0,0.5);";
        document.body.appendChild(cursorElement);
    }
    cursorElement.style.display = 'block';

    try {
        if (!faceLandmarker) {
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
        }

        if(generation!==startGeneration)return;
        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.setAttribute('autoplay', '');
            videoElement.setAttribute('playsinline', '');
            videoElement.style.display = 'none';
            document.body.appendChild(videoElement);
        }

        // Reuse the call stream instead of opening the same camera twice.
        ownsMediaStream = !callVideo;
        const acquired = callVideo ? callVideo.srcObject : await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        if(generation!==startGeneration){if(!callVideo)acquired.getTracks().forEach(track=>track.stop());return;}
        mediaStream = acquired;
        videoElement.muted = true;
        videoElement.srcObject = mediaStream;
        
        await videoElement.play();
        if (generation !== startGeneration) return;
        const track = mediaStream.getVideoTracks()[0];
        if (!track || track.readyState === 'ended') throw new Error('Camera is unavailable');
        track.addEventListener('ended', () => {
            if (generation === startGeneration) detenerHeadTracking(true);
        }, { once: true });
        webcamRunning = true;
        resetDwell();
        localStorage.setItem('senyaHeadTrackingActive', 'true');
        const button = document.getElementById('activarHeadTracking');
        if (button) { button.style.background = '#e0f2fe'; button.setAttribute('aria-pressed', 'true'); }
        predecirMovimiento();

    } catch (error) {
        if(generation!==startGeneration)return;
        console.error("Error al iniciar el seguimiento:", error);
        if (!esAutoInicio) {
            alert("Unable to start the camera. Check your camera permissions.");
        }
        detenerHeadTracking(true);
    } finally {
        if (generation === startGeneration) starting = false;
    }
}

function detenerHeadTracking(silent=false) {
    ++startGeneration;
    starting = false;
    resetDwell();
    webcamRunning = false;
    localStorage.removeItem('senyaHeadTrackingActive'); // Borrar estado guardado

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (mediaStream) {
        if (ownsMediaStream) mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (videoElement) {
        videoElement.onloadedmetadata = null;
        videoElement.srcObject = null;
    }
    if (cursorElement) {
        cursorElement.style.display = 'none';
    }

    const botonActivar = document.getElementById('activarHeadTracking');
    if (botonActivar) { botonActivar.style.background = ''; botonActivar.setAttribute('aria-pressed', 'false'); }

    if(!silent)alert("Head control disabled.");
}

let posXSuavizada = window.innerWidth / 2;
let posYSuavizada = window.innerHeight / 2;

function predecirMovimiento() {
    if (!webcamRunning || !faceLandmarker || !videoElement) return;

    if (videoElement.readyState >= 2 && videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        let results;
        try { results = faceLandmarker.detectForVideo(videoElement, performance.now()); }
        catch (error) { console.error('Head control tracking failed:', error); detenerHeadTracking(true); return; }

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const nariz = results.faceLandmarks[0][1]; 

            // Use the resting position as center and amplify small head movements.
            if (!neutralHeadPosition) neutralHeadPosition = { x: nariz.x, y: nariz.y };
            const targetX = Math.max(10, Math.min(window.innerWidth - 10,
                (0.5 + (neutralHeadPosition.x - nariz.x) * HEAD_SENSITIVITY) * window.innerWidth));
            const targetY = Math.max(10, Math.min(window.innerHeight - 10,
                (0.5 + (nariz.y - neutralHeadPosition.y) * HEAD_SENSITIVITY) * window.innerHeight));

            posXSuavizada += (targetX - posXSuavizada) * CURSOR_SMOOTHING;
            posYSuavizada += (targetY - posYSuavizada) * CURSOR_SMOOTHING;

            if (cursorElement) {
                cursorElement.style.left = `${posXSuavizada}px`;
                cursorElement.style.top = `${posYSuavizada}px`;
            }

            const elementoBajoCursor = document.elementFromPoint(posXSuavizada, posYSuavizada);
            window.dispatchEvent(new CustomEvent('senya:head-pointer', { detail: { element: elementoBajoCursor } }));
            const objetivo = elementoBajoCursor?.closest('button, a, input, textarea, select, summary, [role="button"]');
            updateDwell(objetivo, performance.now());
            if (!objetivo) {
                const centroPantallaY = window.innerHeight / 2;
                const distanciaCentro = posYSuavizada - centroPantallaY;

                if (Math.abs(distanciaCentro) > 150) { 
                    const velocidadScroll = (distanciaCentro > 0 ? 1 : -1) * 4;
                    window.scrollBy({ top: velocidadScroll, behavior: 'auto' });
                }
            }
        } else {
            resetDwell();
            window.dispatchEvent(new CustomEvent('senya:head-pointer', { detail: { element: null } }));
        }
    }

    if (webcamRunning) {
        animationFrameId = requestAnimationFrame(predecirMovimiento);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const botonActivar = document.getElementById('activarHeadTracking');
    
    // Si el usuario ya lo había activado antes en otra página, se enciende solo al cargar esta
    if (localStorage.getItem('senyaHeadTrackingActive') === 'true') {
        iniciarHeadTracking(true);
    }

    if (botonActivar) {
        botonActivar.addEventListener('click', () => {
            if (!webcamRunning && !starting) {
                iniciarHeadTracking(false);
            } else {
                detenerHeadTracking();
            }
        });
    }
});
window.addEventListener('senya-call-media-ready', () => {
    if (localStorage.getItem('senyaHeadTrackingActive') === 'true') iniciarHeadTracking(true);
});

window.addEventListener("senya:reset-accessibility",()=>detenerHeadTracking(true));

// Release the camera when navigating away, preserving the user's preference.
window.addEventListener('pagehide', () => {
    const resume = webcamRunning || starting;
    detenerHeadTracking(true);
    if (resume) localStorage.setItem('senyaHeadTrackingActive', 'true');
});
window.addEventListener('pageshow', event => {
    if (event.persisted && localStorage.getItem('senyaHeadTrackingActive') === 'true') iniciarHeadTracking(true);
});
