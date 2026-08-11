document.addEventListener("DOMContentLoaded", function() {
    // 1. VERIFICAR SI HAY UNA SESIÓN ACTIVA PRIMERO
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        // Si no ha iniciado sesión, expulsarlo inmediatamente al sign in
        window.location.href = "signin.html";
        return; // Detener la ejecución del script aquí
    }

    // 2. Si sí está logueado, recuperar y rellenar los datos del usuario
    const userData = JSON.parse(localStorage.getItem("userProfile"));

    if (userData) {
        document.getElementById("firstName").value = userData.firstName || "";
        document.getElementById("lastName").value = userData.lastName || "";
        document.getElementById("email").value = userData.email || "";
        document.getElementById("birth").value = userData.birth || "";
        document.getElementById("phone").value = userData.phone || "";
        document.getElementById("whatsapp").value = userData.whatsapp || "";
        document.getElementById("address").value = userData.address || "";
        
        const displayName = document.getElementById("displayName");
        if (displayName) {
            displayName.textContent = `${userData.firstName || ""} ${userData.lastName || ""}`;
        }
    }

    // 3. Cargar la foto de perfil guardada previamente si existe
    const previewImage = document.getElementById("previewImage");
    const imageUpload = document.getElementById("imageUpload");
    const savedImage = localStorage.getItem("userProfileImage");
    
    if (savedImage && previewImage) {
        previewImage.src = savedImage;
    }

    if (imageUpload && previewImage) {
        imageUpload.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    previewImage.src = base64Image;
                    localStorage.setItem("userProfileImage", base64Image);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Funcionalidad del Modal de Cerrar Sesión
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutModal = document.getElementById("logoutModal");
    const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener("click", function() {
            logoutModal.style.display = "flex";
        });
    }

    if (cancelLogoutBtn && logoutModal) {
        cancelLogoutBtn.addEventListener("click", function() {
            logoutModal.style.display = "none";
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", function() {
            // Removemos el estado de sesión activa
            localStorage.removeItem("isLoggedIn");

            // Redirigir al home público
            window.location.href = "index.html";
        });
    }

    if (logoutModal) {
        logoutModal.addEventListener("click", function(e) {
            if (e.target === logoutModal) {
                logoutModal.style.display = "none";
            }
        });
    }
});

// 5. Función para habilitar/deshabilitar la edición de las tarjetas con tu azul oscuro
function toggleEdit(button) {
    const card = button.closest(".card");
    const inputs = card.querySelectorAll("input");
    const isDisabled = inputs[0].disabled;

    if (isDisabled) {
        inputs.forEach(input => input.disabled = false);
        button.textContent = "Save";
        button.style.backgroundColor = "#1a365d"; // Tu azul oscuro preferido
        button.style.color = "#fff";
    } else {
        inputs.forEach(input => {
            const id = input.id;
            const value = input.value;
            updateUserData(id, value);
            input.disabled = true;
        });

        button.textContent = "Edit";
        button.style.backgroundColor = "";
        button.style.color = "";
        alert("¡Cambios guardados correctamente!");
    }
}

// Función auxiliar para actualizar propiedades en el localStorage
function updateUserData(key, value) {
    let userData = JSON.parse(localStorage.getItem("userProfile")) || {};
    userData[key] = value;
    localStorage.setItem("userProfile", JSON.stringify(userData));

    if (key === "firstName" || key === "lastName") {
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        document.getElementById("displayName").textContent = `${firstName} ${lastName}`;
    }
}