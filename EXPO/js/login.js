/* =========================
   ACCOUNT TYPE
========================= */
const accountTypeSection = document.getElementById("accountTypeSection");
const userRegisterSection = document.getElementById("userRegisterSection");
const userOption = document.getElementById("userOption");
const interpreterOption = document.getElementById("interpreterOption");
const changeAccount = document.getElementById("changeAccount");

userOption.addEventListener("click", () => {
    accountTypeSection.style.display = "none";
    userRegisterSection.classList.add("active");
    document.querySelector(".login-card").scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

interpreterOption.addEventListener("click", () => {
    window.location.href = "interpreter-register.html";
});

changeAccount.addEventListener("click", () => {
    userRegisterSection.classList.remove("active");
    accountTypeSection.style.display = "block";
    document.querySelector(".login-card").scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* =========================
   PASSWORD ELEMENTS
========================= */
const registerPassword = document.getElementById("registerPassword");
const togglePassword = document.getElementById("togglePassword");
const passwordSecurity = document.querySelector(".password-security");
const passwordStrengthText = document.getElementById("passwordStrengthText");
const passwordStrengthProgress = document.getElementById("passwordStrengthProgress");
const registerSubmit = document.getElementById("registerSubmit");
const lengthRequirement = document.getElementById("lengthRequirement");
const uppercaseRequirement = document.getElementById("uppercaseRequirement");
const lowercaseRequirement = document.getElementById("lowercaseRequirement");
const numberRequirement = document.getElementById("numberRequirement");
const specialRequirement = document.getElementById("specialRequirement");

/* =========================
   SHOW / HIDE PASSWORD
========================= */
togglePassword.addEventListener("click", () => {
    const hidden = registerPassword.type === "password";
    registerPassword.type = hidden ? "text" : "password";
    const icon = togglePassword.querySelector("i");
    icon.classList.toggle("fa-eye", !hidden);
    icon.classList.toggle("fa-eye-slash", hidden);
});

/* =========================
   PASSWORD REQUIREMENT
========================= */
function updateRequirement(element, valid) {
    const icon = element.querySelector("i");
    if (valid) {
        element.classList.add("valid");
        element.classList.remove("invalid");
        icon.className = "fa-solid fa-circle-check";
    } else {
        element.classList.remove("valid");
        element.classList.add("invalid");
        icon.className = "fa-solid fa-circle";
    }
}

/* =========================
   PASSWORD VALIDATION
========================= */
function validatePassword() {
    const password = registerPassword.value;
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);

    updateRequirement(lengthRequirement, hasLength);
    updateRequirement(uppercaseRequirement, hasUppercase);
    updateRequirement(lowercaseRequirement, hasLowercase);
    updateRequirement(numberRequirement, hasNumber);
    updateRequirement(specialRequirement, hasSpecial);

    let score = 0;
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    passwordSecurity.classList.remove("weak", "medium", "strong");

    if (password.length === 0) {
        passwordStrengthText.textContent = "Enter a password";
        passwordStrengthProgress.style.width = "0%";
        registerSubmit.disabled = true;
        return;
    }

    if (score <= 2) {
        passwordSecurity.classList.add("weak");
        passwordStrengthText.textContent = "Weak";
        passwordStrengthProgress.style.width = "33%";
        registerSubmit.disabled = true;
        return;
    }

    if (score <= 4) {
        passwordSecurity.classList.add("medium");
        passwordStrengthText.textContent = "Medium";
        passwordStrengthProgress.style.width = "66%";
        registerSubmit.disabled = true;
        return;
    }

    passwordSecurity.classList.add("strong");
    passwordStrengthText.textContent = "Strong";
    passwordStrengthProgress.style.width = "100%";
    registerSubmit.disabled = false;
}

registerPassword.addEventListener("input", validatePassword);
registerSubmit.disabled = true;

/* =========================
   REGISTER FORM
========================= */
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const birthday = document.getElementById("registerBirth").value;
    const phone = document.getElementById("registerPhone").value.trim();
    const whatsapp = document.getElementById("registerWhatsapp").value.trim();
    const address = document.getElementById("registerAddress").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = registerPassword.value;

    const securePassword =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);

    if (!securePassword) {
        alert("Your password does not meet SENYA's security requirements.");
        registerPassword.focus();
        return;
    }

    registerSubmit.disabled=true;
    try {
        const registration=await Senya.signUp(email,password,{role:'user',firstName,lastName,birthday,phone,whatsapp,address});
        sessionStorage.setItem('senyaRegistrationEmail',email);
        alert(registration.access_token?'Account created. You can now sign in with your email and password.':'Check your email to confirm your account before signing in. If you already registered with this email, use your existing password or select Reset password.');
        location.href='signin.html';
    } catch(e) { Senya.error(e); } finally { registerSubmit.disabled=false; }
});
