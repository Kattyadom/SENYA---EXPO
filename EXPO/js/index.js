// Animación progresiva de los números (Counters)
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter");
    
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        let count = 0;
        
        // Calculamos la velocidad en función del número objetivo para que sea fluido
        const speed = Math.max(target / 40, 1); 

        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count) + "+";
                setTimeout(updateCount, 40); // Intervalo de tiempo entre cada frame
            } else {
                counter.innerText = target + "+";
            }
        };

        // Iniciamos la animación con un pequeño retraso para que cargue la interfaz
        setTimeout(updateCount, 300);
    });
});