document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    const togglePasswordBtn =
        document.getElementById("togglePassword") ||
        document.getElementById("showPassword");

    const passwordInput = document.getElementById("password");

    if (togglePasswordBtn && passwordInput) {

        togglePasswordBtn.addEventListener("click", () => {

            const type =
                passwordInput.getAttribute("type") === "password"
                    ? "text"
                    : "password";

            passwordInput.setAttribute("type", type);

            const icon = togglePasswordBtn.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-eye");
                icon.classList.toggle("fa-eye-slash");
            }
        });
    }

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const correo = document
                .getElementById("email")
                .value
                .trim()
                .toLowerCase();

            const password = document
                .getElementById("password")
                .value;

            const usuarios =
                JSON.parse(localStorage.getItem("usuarios")) || [];

            const usuario = usuarios.find(
                usuario =>
                    usuario.correo === correo &&
                    usuario.password === password
            );

            if (!usuario) {
                alert("Email or password incorrect.");
                return;
            }

            localStorage.setItem(
                "usuarioActivo",
                JSON.stringify(usuario)
            );

            window.location.href = "index.html";
        });
    }
});