const passwordInput = document.getElementById("password");
const togglePassword = document.querySelector(".toggle-password");
const loginForm = document.querySelector("form");
const loginButton = document.querySelector(".login-btn");

togglePassword.addEventListener("click", () => {

    const icon = togglePassword.querySelector("i");

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    }else{

        passwordInput.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

});

loginForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    loginButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Signing In...
    `;

    loginButton.disabled = true;

    setTimeout(()=>{

        window.location.href="dashboard.html";

    },1800);

});