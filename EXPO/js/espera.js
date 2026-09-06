document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar datos del formulario previo
    const savedRequest = localStorage.getItem('currentRequest');

    if (savedRequest) {
        try {
            const data = JSON.parse(savedRequest);
            
            const serviceSpan = document.getElementById('summaryService');
            const languageSpan = document.getElementById('summaryLanguage');

            if (serviceSpan) serviceSpan.textContent = data.service || 'Not specified';
            if (languageSpan) languageSpan.textContent = data.language || 'Not specified';
        } catch (e) {
            console.error("Error parsing request data:", e);
        }
    }

    // 2. Temporizador de tiempo estimado (2 minutos)
    let totalSeconds = 120; // 2 minutos
    const timerText = document.getElementById('timerText');
    const progressFill = document.getElementById('progressFill');

    const countdown = setInterval(() => {
        totalSeconds--;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timerText) {
            timerText.textContent = `${formattedTime} minutes`;
        }

        // Actualizar barra de progreso dinámicamente
        if (progressFill) {
            const percentage = ((120 - totalSeconds) / 120) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        if (totalSeconds <= 0) {
            clearInterval(countdown);
            if (timerText) {
                timerText.textContent = "Connecting now...";
            }
        }
    }, 1000);
});