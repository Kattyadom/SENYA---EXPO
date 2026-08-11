document.addEventListener("DOMContentLoaded", () => {

    const usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo")
    );

    if (!usuarioActivo) {
        window.location.href = "signin.html";
        return;
    }

    cargarDatos(usuarioActivo);

    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");

    if (imageUpload && previewImage) {

        const imagenGuardada = localStorage.getItem(
            `profileImage_${usuarioActivo.id}`
        );

        if (imagenGuardada) {
            previewImage.src = imagenGuardada;
        }

        imageUpload.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = function (event) {

                previewImage.src = event.target.result;

                localStorage.setItem(
                    `profileImage_${usuarioActivo.id}`,
                    event.target.result
                );
            };

            reader.readAsDataURL(file);
        });
    }

    const editButtons = document.querySelectorAll(".edit-btn");

    editButtons.forEach((btn) => {

        btn.addEventListener("click", () => {

            const card = btn.closest(".card");
            const inputs = card.querySelectorAll("input");

            const editando = btn.dataset.editando === "true";

            inputs.forEach(input => {
                input.disabled = editando;
            });

            if (editando) {

                guardarDatos();

                btn.textContent = "Edit";
                btn.dataset.editando = "false";

            } else {

                btn.textContent = "Save";
                btn.dataset.editando = "true";
            }
        });
    });

    document.querySelectorAll(".card input").forEach(input => {
        input.disabled = true;
    });

    const sections = document.querySelectorAll("main section");
    const navLinks = document.querySelectorAll(".sidebar nav a");

    window.addEventListener("scroll", () => {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 180;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (
                link.getAttribute("href") === "#" + currentSection
            ) {
                link.classList.add("active");
            }
        });
    });
function cargarDatos(usuario) {

    document.getElementById("firstName").value =
        usuario.nombre || "";

    document.getElementById("lastName").value =
        usuario.apellido || "";

    document.getElementById("email").value =
        usuario.correo || "";

    document.getElementById("birth").value =
        usuario.nacimiento || "";

    document.getElementById("phone").value =
        usuario.telefono || "";

    const whatsappInput =
        document.querySelector("#contact input:not(#phone)");

    if (whatsappInput) {
        whatsappInput.value =
            usuario.whatsapp || "";
    }

    document.getElementById("address").value =
        usuario.direccion || "";

    document.getElementById("displayName").textContent =
        `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
}


function guardarDatos() {

    const usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo")
    );

    if (!usuarioActivo) return;

    const nombre =
        document.getElementById("firstName").value.trim();

    const apellido =
        document.getElementById("lastName").value.trim();

    const correo =
        document.getElementById("email").value.trim().toLowerCase();

    const nacimiento =
        document.getElementById("birth").value;

    const telefono =
        document.getElementById("phone").value.trim();

    const whatsappInput =
        document.querySelector("#contact input:not(#phone)");

    const whatsapp =
        whatsappInput ? whatsappInput.value.trim() : "";

    const direccion =
        document.getElementById("address").value.trim();

    let usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];

    const index = usuarios.findIndex(
        usuario => usuario.id === usuarioActivo.id
    );

    if (index === -1) return;

    usuarios[index] = {
        ...usuarios[index],
        nombre,
        apellido,
        correo,
        nacimiento,
        telefono,
        whatsapp,
        direccion
    };

    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );

    localStorage.setItem(
        "usuarioActivo",
        JSON.stringify(usuarios[index])
    );

    document.getElementById("displayName").textContent =
        `${nombre} ${apellido}`.trim();

    alert("Information saved successfully.");
}})
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");
const logoutOverlay = document.querySelector(".logout-modal-overlay");

if (logoutBtn && logoutModal) {

    logoutBtn.addEventListener("click", (event) => {
        event.preventDefault();

        logoutModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    function closeLogoutModal() {
        logoutModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    cancelLogout.addEventListener("click", closeLogoutModal);

    logoutOverlay.addEventListener("click", closeLogoutModal);

    confirmLogout.addEventListener("click", () => {
        localStorage.removeItem("usuarioActivo");
        window.location.href = "index.html";
    });
}