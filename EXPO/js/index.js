function openLogin(){
    document.getElementById("loginModal").style.display="flex";
}

window.onclick = function(event){

    if(event.target==document.getElementById("loginModal")){
        document.getElementById("loginModal").style.display="none";
    }

}

function showLogin(){

    document.getElementById("loginForm").style.display="block";
    document.getElementById("registerForm").style.display="none";

    document.querySelectorAll(".tab")[0].classList.add("active");
    document.querySelectorAll(".tab")[1].classList.remove("active");

}

function showRegister(){

    document.getElementById("loginForm").style.display="none";
    document.getElementById("registerForm").style.display="block";

    document.querySelectorAll(".tab")[1].classList.add("active");
    document.querySelectorAll(".tab")[0].classList.remove("active");

}

function login(){

    let email=document.getElementById("email").value;
    let password=document.getElementById("password").value;

    if(email!="" && password!=""){

        document.getElementById("loginModal").style.display="none";

        document.getElementById("welcomeMessage")
        .classList.add("show");

        setTimeout(function(){

            document.getElementById("welcomeMessage")
            .classList.remove("show");

        },3000);

    }else{

        document.getElementById("message").innerHTML=
        "Please complete all fields.";

    }

}