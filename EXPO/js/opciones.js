document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Buscador de Servicios
    // ----------------------------------------------------
    const searchInput = document.getElementById("searchInput");
    const cards = document.querySelectorAll(".service-card");

    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            const value = this.value.toLowerCase().trim();

            cards.forEach(card => {
                const title = card.querySelector("h2") ? card.querySelector("h2").textContent.toLowerCase() : "";
                const category = card.querySelector(".category") ? card.querySelector(".category").textContent.toLowerCase() : "";
                const description = card.querySelector("p") ? card.querySelector("p").textContent.toLowerCase() : "";

                if (
                    title.includes(value) ||
                    category.includes(value) ||
                    description.includes(value)
                ) {
                    card.style.display = ""; // Vuelve a su estado por CSS (flex/block)
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // ----------------------------------------------------
    // 2. Control de Acceso al Solicitar Intérprete
    // ----------------------------------------------------
    const requestButtons = document.querySelectorAll(".call-now");
    const callModal = document.getElementById("callModal");

    requestButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            // Comprobamos si hay un usuario en sesión
            const usuarioActivo = sessionStorage.getItem("senyaAuth");

            // Si NO está autenticado y existe el modal, detenemos la navegación y abrimos el modal
            if (!usuarioActivo && callModal) {
                e.preventDefault();
                callModal.classList.add("active");
            }
        });
    });
});