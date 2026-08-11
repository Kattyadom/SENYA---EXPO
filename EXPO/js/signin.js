document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const errorModal = document.getElementById("errorModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const tryAgainBtn = document.getElementById("tryAgainBtn");

    // Asegurar que el modal inicie oculto
    if (errorModal) {
        errorModal.style.display = "none";
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();

            if (!loginForm.checkValidity()) {
                loginForm.reportValidity();
                return;
            }

            const emailInput = document.getElementById("email").value.trim();
            const passwordInput = document.getElementById("password").value;

            const storedUser = JSON.parse(localStorage.getItem("userProfile"));

            // Validar credenciales
            if (storedUser && storedUser.email === emailInput && storedUser.password === passwordInput) {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "home.html";
            } else {
                // Mostrar el modal flotante
                if (errorModal) {
                    errorModal.style.display = "flex";
                }
            }
        });
    }

    // Cerrar modal al hacer clic en la "X"
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function() {
            errorModal.style.display = "none";
        });
    }

    // Cerrar modal y reintentar al hacer clic en "Try again"
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener("click", function() {
            errorModal.style.display = "none";
            document.getElementById("password").value = ""; // Limpiar contraseña por comodidad
        });
    }

    // Cerrar el modal si el usuario hace clic fuera de la tarjeta (en el fondo oscuro)
    if (errorModal) {
        errorModal.addEventListener("click", function(e) {
            if (e.target === errorModal) {
                errorModal.style.display = "none";
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", function() {
    // Nota: Reemplaza "showPassword" por "togglePassword" si estás en el archivo de registro (login.html)
    const togglePasswordBtn = document.getElementById("showPassword") || document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", function() {
            // Alternar el tipo del input entre password y text
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);

            // Cambiar el icono del ojito (abierto / cerrado)
            const icon = togglePasswordBtn.querySelector("i");
            if (icon) {
                if (type === "text") {
                    icon.classList.remove("fa-eye", "fa-regular");
                    icon.classList.add("fa-eye-slash", "fa-solid");
                } else {
                    icon.classList.remove("fa-eye-slash", "fa-solid");
                    icon.classList.add("fa-eye", "fa-regular");
                }
            }
        });
    }
});