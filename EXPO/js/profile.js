const imageUpload = document.getElementById("imageUpload");
const previewImage = document.getElementById("previewImage");
imageUpload.addEventListener("change", function(){
    const file = this.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            previewImage.src = e.target.result;
            localStorage.setItem("profileImage", e.target.result);
        }
        reader.readAsDataURL(file);
    }
});
window.addEventListener("load", ()=>{
    if(localStorage.getItem("profileImage")){
        previewImage.src = localStorage.getItem("profileImage");
    }
    cargarDatos();
});
function guardarDatos(){
    const datos = {
        nombre: document.getElementById("firstName").value,
        apellido: document.getElementById("lastName").value,
        correo: document.getElementById("email").value,
        telefono: document.getElementById("phone").value,
        direccion: document.getElementById("address").value,
        nacimiento: document.getElementById("birth").value
    };
    localStorage.setItem("perfilUsuario", JSON.stringify(datos));
    document.getElementById("displayName").textContent =
        datos.nombre + " " + datos.apellido;
    alert("Información guardada correctamente.");
}
function cargarDatos(){
    const datos = JSON.parse(localStorage.getItem("perfilUsuario"));
    if(datos){
        document.getElementById("firstName").value = datos.nombre;
        document.getElementById("lastName").value = datos.apellido;
        document.getElementById("email").value = datos.correo;
        document.getElementById("phone").value = datos.telefono;
        document.getElementById("address").value = datos.direccion;
        document.getElementById("birth").value = datos.nacimiento;
        document.getElementById("displayName").textContent =
            datos.nombre + " " + datos.apellido;
    }
}
function descartarCambios(){
    cargarDatos();
}
const editButtons = document.querySelectorAll(".edit-btn");
editButtons.forEach((btn)=>{
    btn.addEventListener("click", ()=>{
        const card = btn.closest(".card");
        const inputs = card.querySelectorAll("input");
        const editando = btn.dataset.editando === "true";
        inputs.forEach(input=>{
            input.disabled = editando;
        });
        if(editando){
            guardarDatos();
            btn.textContent = "Editar";
            btn.dataset.editando = "false";
        }else{
            btn.textContent = "Guardar";
            btn.dataset.editando = "true";
        }
    });
});
document.querySelectorAll(".card input").forEach(input=>{
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
        if(link.getAttribute("href") === "#" + currentSection){
            link.classList.add("active");
        }
    });
});