function goToHome() {
    if (localStorage.getItem("usuarioLogueado") === "true") {
        window.location.href = "home.html";
    } else {
        window.location.href = "index.html";
    }
}