document.addEventListener("DOMContentLoaded", () => {

    const profileLinks =
        document.querySelectorAll('a[href="profile.html"]');

    const modal =
        document.getElementById("loginModal");

    const modalClose =
        document.getElementById("modalClose");

    const modalLater =
        document.getElementById("modalLater");

    if (modal) {

        function openModal() {

            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeModal() {

            modal.classList.remove("active");
            document.body.style.overflow = "";
        }

        profileLinks.forEach(link => {

            link.addEventListener("click", (event) => {

                const usuarioActivo =
                    localStorage.getItem("usuarioActivo");

                if (!usuarioActivo) {

                    event.preventDefault();

                    openModal();
                }
            });
        });

        if (modalClose) {
            modalClose.addEventListener(
                "click",
                closeModal
            );
        }

        if (modalLater) {
            modalLater.addEventListener(
                "click",
                closeModal
            );
        }

        const modalOverlay =
            document.querySelector(".login-modal-overlay");

        if (modalOverlay) {
            modalOverlay.addEventListener(
                "click",
                closeModal
            );
        }
    }

    const callButtons =
        document.querySelectorAll(".call-now");

    const callModal =
        document.getElementById("callModal");

    const callModalClose =
        document.getElementById("callModalClose");

    const callModalLater =
        document.getElementById("callModalLater");

    if (callModal) {

        function openCallModal() {

            callModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeCallModal() {

            callModal.classList.remove("active");
            document.body.style.overflow = "";
        }

        callButtons.forEach(button => {

            button.addEventListener("click", function(event) {

                const usuarioActivo =
                    localStorage.getItem("usuarioActivo");

                if (!usuarioActivo) {

                    event.preventDefault();
                    event.stopImmediatePropagation();

                    openCallModal();
                }

            }, true);
        });

        if (callModalClose) {
            callModalClose.addEventListener(
                "click",
                closeCallModal
            );
        }

        if (callModalLater) {
            callModalLater.addEventListener(
                "click",
                closeCallModal
            );
        }

        const callOverlay =
            document.querySelector(".call-modal-overlay");

        if (callOverlay) {
            callOverlay.addEventListener(
                "click",
                closeCallModal
            );
        }
    }
});