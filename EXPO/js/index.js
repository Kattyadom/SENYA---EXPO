function openLogin(){
    document.getElementById("loginModal").style.display = "flex";
}

window.onclick = function(event){
    if(event.target == document.getElementById("loginModal")){
        document.getElementById("loginModal").style.display = "none";
    }
}

function showLogin(){
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";

    document.querySelectorAll(".tab")[0].classList.add("active");
    document.querySelectorAll(".tab")[1].classList.remove("active");
}

function showRegister(){
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";

    document.querySelectorAll(".tab")[1].classList.add("active");
    document.querySelectorAll(".tab")[0].classList.remove("active");
}

function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if(email != "" && password != ""){
        document.getElementById("loginModal").style.display = "none";

        document.getElementById("welcomeMessage")
        .classList.add("show");

        setTimeout(function(){
            document.getElementById("welcomeMessage")
            .classList.remove("show");
        }, 3000);

    }else{
        document.getElementById("message").innerHTML = "Please complete all fields.";
    }
}

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