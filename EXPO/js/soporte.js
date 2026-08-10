const modal = document.getElementById("sentModal");
const closeModal = document.getElementById("closeModal");
const modalDone = document.getElementById("modalDone");
const sendButtons = document.querySelectorAll(".send-button");
const textareas = document.querySelectorAll(".support-card textarea");

function openModal(){
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
}

function closeSentModal(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow="";

    textareas.forEach(textarea=>{
        textarea.value="";
    });
}

sendButtons.forEach(button=>{
    button.addEventListener("click",openModal);
});

closeModal.addEventListener("click",closeSentModal);
modalDone.addEventListener("click",closeSentModal);

modal.addEventListener("click",event=>{
    if(event.target===modal){
        closeSentModal();
    }
});

document.addEventListener("keydown",event=>{
    if(event.key==="Escape" && modal.classList.contains("show")){
        closeSentModal();
    }
});