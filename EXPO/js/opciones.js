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

});
