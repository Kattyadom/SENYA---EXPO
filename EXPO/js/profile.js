document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // 0. CAMBIO DE TEMA (DARK / LIGHT)
    // ==============================
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeStatusText = document.getElementById("themeStatusText");

    function setTheme(theme) {
        if (theme === "light") {
            document.body.classList.add("light-theme");
            if (themeStatusText) themeStatusText.textContent = "Light theme (Active)";
        } else {
            document.body.classList.remove("light-theme");
            if (themeStatusText) themeStatusText.textContent = "Dark theme (Active)";
        }
        localStorage.setItem("theme", theme);
    }

    // Cargar tema guardado previamente
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isLight = document.body.classList.contains("light-theme");
            setTheme(isLight ? "dark" : "light");
        });
    }

    // ==============================
    // 1. VERIFICAR SESIÓN DE USUARIO
    // ==============================
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
        window.location.href = "signin.html";
        return;
    }

    // Cargar información y preferencias guardadas
    cargarDatos(usuarioActivo);
    cargarPreferencias(usuarioActivo);

    // ==============================
    // 2. FOTO DE PERFIL
    // ==============================
    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");

    if (imageUpload && previewImage) {
        const imagenGuardada = localStorage.getItem(`profileImage_${usuarioActivo.id}`);
        if (imagenGuardada) {
            previewImage.src = imagenGuardada;
        }

        imageUpload.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                previewImage.src = event.target.result;
                localStorage.setItem(`profileImage_${usuarioActivo.id}`, event.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    // ==============================
    // 3. EDICIÓN DE DATOS PERSONALES
    // ==============================
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".card");
            if (!card) return;

            const inputs = card.querySelectorAll("input");
            const editando = btn.dataset.editando === "true";

            inputs.forEach((input) => {
                input.disabled = editando;
            });

            if (editando) {
                guardarDatos();
                btn.textContent = "Edit";
                btn.style.backgroundColor = "";
                btn.dataset.editando = "false";
            } else {
                btn.textContent = "Save";
                btn.style.backgroundColor = "#10B981";
                btn.dataset.editando = "true";
            }
        });
    });

    // ==============================
    // 4. NAVEGACIÓN EN PÁGINA (SCROLL ACTIVO)
    // ==============================
    const sections = document.querySelectorAll("main section");
    const navLinks = document.querySelectorAll(".sidebar nav a");

    window.addEventListener("scroll", () => {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 180;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + currentSection) {
                link.classList.add("active");
            }
        });
    });

    // ==============================
    // 5. BOTONES DE GUARDAR PREFERENCIAS
    // ==============================
    const saveCommunication = document.getElementById("saveCommunication");
    if (saveCommunication) {
        saveCommunication.addEventListener("click", () => {
            guardarPreferencias();
            alert("Communication preferences saved successfully.");
        });
    }

    const saveAccessibility = document.getElementById("saveAccessibility");
    if (saveAccessibility) {
        saveAccessibility.addEventListener("click", () => {
            guardarPreferencias();
            alert("Accessibility preferences saved successfully.");
        });
    }

    // ==============================
    // 6. CERRAR SESIÓN (MODAL)
    // ==============================
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");
    const logoutOverlay = document.querySelector(".logout-modal-overlay");

    if (logoutBtn && logoutModal && cancelLogout && confirmLogout && logoutOverlay) {
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
});

// ==========================================
// FUNCIONES DE APOYO
// ==========================================

function cargarDatos(usuario) {
    const fields = ["firstName", "lastName", "email", "birth", "phone", "whatsapp", "address"];
    const keys = ["nombre", "apellido", "correo", "nacimiento", "telefono", "whatsapp", "direccion"];

    fields.forEach((fieldId, index) => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = usuario[keys[index]] || "";
        }
    });

    const displayName = document.getElementById("displayName");
    if (displayName) {
        displayName.textContent = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "SENYA User";
    }
}

function guardarDatos() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) return;

    const nombre = document.getElementById("firstName")?.value.trim() || "";
    const apellido = document.getElementById("lastName")?.value.trim() || "";
    const correo = document.getElementById("email")?.value.trim().toLowerCase() || "";
    const nacimiento = document.getElementById("birth")?.value || "";
    const telefono = document.getElementById("phone")?.value.trim() || "";
    const whatsapp = document.getElementById("whatsapp")?.value.trim() || "";
    const direccion = document.getElementById("address")?.value.trim() || "";

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex((usuario) => usuario.id === usuarioActivo.id);

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

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarios[index]));

    const displayName = document.getElementById("displayName");
    if (displayName) {
        displayName.textContent = `${nombre} ${apellido}`.trim() || "SENYA User";
    }

    alert("Information saved successfully.");
}

function guardarPreferencias() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) return;

    const preferencias = {
        communication: {
            lessa: document.getElementById("lessaPreference")?.checked || false,
            spanish: document.getElementById("spanishPreference")?.checked || false,
            english: document.getElementById("englishPreference")?.checked || false
        },
        assistance: {
            video: document.getElementById("videoPreference")?.checked || false,
            text: document.getElementById("textPreference")?.checked || false
        },
        accessibility: {
            readAloud: document.getElementById("readAloudPreference")?.checked || false,
            highContrast: document.getElementById("highContrastPreference")?.checked || false,
            largeText: document.getElementById("largeTextPreference")?.checked || false,
            dyslexia: document.getElementById("dyslexiaPreference")?.checked || false,
            headControl: document.getElementById("headControlPreference")?.checked || false
        }
    };

    usuarioActivo.preferencias = preferencias;
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex((usuario) => usuario.id === usuarioActivo.id);

    if (index !== -1) {
        usuarios[index] = {
            ...usuarios[index],
            preferencias
        };
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
}

function cargarPreferencias(usuario) {
    const preferencias = usuario.preferencias || {};
    const communication = preferencias.communication || {};
    const assistance = preferencias.assistance || {};
    const accessibility = preferencias.accessibility || {};

    const setChecked = (id, value, defaultValue = false) => {
        const elem = document.getElementById(id);
        if (elem) elem.checked = value ?? defaultValue;
    };

    setChecked("lessaPreference", communication.lessa, true);
    setChecked("spanishPreference", communication.spanish, false);
    setChecked("englishPreference", communication.english, false);

    setChecked("videoPreference", assistance.video, true);
    setChecked("textPreference", assistance.text, false);

    setChecked("readAloudPreference", accessibility.readAloud, false);
    setChecked("highContrastPreference", accessibility.highContrast, false);
    setChecked("largeTextPreference", accessibility.largeText, false);
    setChecked("dyslexiaPreference", accessibility.dyslexia, false);
    setChecked("headControlPreference", accessibility.headControl, false);
}