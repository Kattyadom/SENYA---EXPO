document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("registerPassword");

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const type = passwordInput.type === "password"
                ? "text"
                : "password";

            passwordInput.type = type;

            const icon = togglePassword.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-eye");
                icon.classList.toggle("fa-eye-slash");
            }
        });
    }

    if (registerForm) {

        registerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const nombre =
                document.getElementById("registerFirstName").value.trim();

            const apellido =
                document.getElementById("registerLastName").value.trim();

            const nacimiento =
                document.getElementById("registerBirth").value;

            const telefono =
                document.getElementById("registerPhone").value.trim();

            const whatsapp =
                document.getElementById("registerWhatsapp").value.trim();

            const direccion =
                document.getElementById("registerAddress").value.trim();

            const correo =
                document.getElementById("registerEmail").value.trim().toLowerCase();

            const password =
                document.getElementById("registerPassword").value;

            let usuarios =
                JSON.parse(localStorage.getItem("usuarios")) || [];

            const usuarioExiste = usuarios.some(
                usuario => usuario.correo === correo
            );

            if (usuarioExiste) {
                alert("This email is already registered.");
                return;
            }

            const nuevoUsuario = {
                id: Date.now(),
                nombre,
                apellido,
                nacimiento,
                telefono,
                whatsapp,
                direccion,
                correo,
                password
            };

            usuarios.push(nuevoUsuario);

            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(nuevoUsuario)
            );

            alert("Account created successfully.");

            window.location.href = "index.html";
        });
    }
});