const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".service-card");
searchInput.addEventListener("keyup", function(){
    const value = this.value.toLowerCase();
    cards.forEach(card =>{
        const title = card.querySelector("h2").textContent.toLowerCase();
        const category = card.querySelector(".category").textContent.toLowerCase();
        const description = card.querySelector("p").textContent.toLowerCase();
        if(
            title.includes(value) ||
            category.includes(value) ||
            description.includes(value)
        ){
            card.style.display = "block";
        }else{
            card.style.display = "none";
        }
    });
});
function selectService(serviceName) {
    localStorage.setItem("senya_selected_service", serviceName);
    window.location.href = "agendar.html";
}