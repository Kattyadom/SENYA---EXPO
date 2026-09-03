document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("sentModal");
    const closeModal = document.getElementById("closeModal");
    const modalDone = document.getElementById("modalDone");
    const sendButtons = document.querySelectorAll(".send-button");
    const textareas = document.querySelectorAll(".support-card textarea");

    function openModal(){
        if (!modal) return;
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeSentModal(){
        if (!modal) return;
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        // AQUÍ ESTÁ TU FUNCIÓN ORIGINAL QUE BORRA LOS TEXTAREAS AL CERRAR
        textareas.forEach(textarea => {
            textarea.value = "";
        });
    }

    // Validación principal en los botones de envío
    sendButtons.forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".support-card");
            if (!card) return;
            
            const textarea = card.querySelector("textarea");
            if (!textarea) return;

            // Validar si el textarea está vacío o solo tiene espacios en blanco
            if (!textarea.value.trim()) {
                textarea.focus();
                textarea.style.borderColor = "#F6639A"; // Alerta visual temporal
                setTimeout(() => {
                    textarea.style.borderColor = "";
                }, 2000);
                return; // Detiene la ejecución y evita abrir el modal
            }

            // Si tiene texto, limpiamos el estilo de alerta y abrimos el modal correctamente
            textarea.style.borderColor = "";
            openModal();
        });
    });

    // Eventos originales para cerrar el modal
    if (closeModal) {
        closeModal.addEventListener("click", closeSentModal);
    }

    if (modalDone) {
        modalDone.addEventListener("click", closeSentModal);
    }

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeSentModal();
            }
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal && modal.classList.contains("show")) {
            closeSentModal();
        }
    });
});