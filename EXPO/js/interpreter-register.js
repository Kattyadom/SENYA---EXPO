const form=document.getElementById('interpreterForm');
const success=document.getElementById('successState');
const password=document.getElementById('password');
const toggle=document.getElementById('togglePassword');
const fileInput=document.getElementById('certificateFile');
const fileLabel=document.getElementById('fileLabel');
const bio=document.getElementById('bio');
const bioCount=document.getElementById('bioCount');
const submitButton=document.getElementById('interpreterSubmit');
const passwordSecurity=document.getElementById('interpreterPasswordSecurity');
const strengthText=document.getElementById('interpreterStrengthText');
const strengthProgress=document.getElementById('interpreterStrengthProgress');
const lengthRequirement=document.getElementById('interpreterLength');
const uppercaseRequirement=document.getElementById('interpreterUppercase');
const lowercaseRequirement=document.getElementById('interpreterLowercase');
const numberRequirement=document.getElementById('interpreterNumber');
const specialRequirement=document.getElementById('interpreterSpecial');

toggle.addEventListener('click',()=>{
    const hidden=password.type==='password';
    password.type=hidden?'text':'password';
    toggle.querySelector('i').className=hidden?'fa-solid fa-eye-slash':'fa-solid fa-eye';
});

function updateRequirement(element,valid){
    const icon=element.querySelector('i');
    if(valid){
        element.classList.add('valid');
        icon.className='fa-solid fa-circle-check';
    }else{
        element.classList.remove('valid');
        icon.className='fa-solid fa-circle';
    }
}

function getPasswordRules(value){
    return{
        hasLength:value.length>=8,
        hasUppercase:/[A-Z]/.test(value),
        hasLowercase:/[a-z]/.test(value),
        hasNumber:/[0-9]/.test(value),
        hasSpecial:/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(value)
    };
}

function isPasswordSecure(value){
    const rules=getPasswordRules(value);
    return rules.hasLength&&rules.hasUppercase&&rules.hasLowercase&&rules.hasNumber&&rules.hasSpecial;
}

function validatePassword(){
    const value=password.value;
    const rules=getPasswordRules(value);
    updateRequirement(lengthRequirement,rules.hasLength);
    updateRequirement(uppercaseRequirement,rules.hasUppercase);
    updateRequirement(lowercaseRequirement,rules.hasLowercase);
    updateRequirement(numberRequirement,rules.hasNumber);
    updateRequirement(specialRequirement,rules.hasSpecial);
    let score=0;
    if(rules.hasLength)score++;
    if(rules.hasUppercase)score++;
    if(rules.hasLowercase)score++;
    if(rules.hasNumber)score++;
    if(rules.hasSpecial)score++;
    passwordSecurity.classList.remove('weak','medium','strong');
    if(value.length===0){
        strengthText.textContent='Enter a password';
        strengthProgress.style.width='0%';
        submitButton.disabled=true;
        return;
    }
    if(score<=2){
        passwordSecurity.classList.add('weak');
        strengthText.textContent='Weak';
        strengthProgress.style.width='33%';
        submitButton.disabled=true;
        return;
    }
    if(score<=4){
        passwordSecurity.classList.add('medium');
        strengthText.textContent='Medium';
        strengthProgress.style.width='66%';
        submitButton.disabled=true;
        return;
    }
    passwordSecurity.classList.add('strong');
    strengthText.textContent='Strong';
    strengthProgress.style.width='100%';
    submitButton.disabled=false;
}

async function hashPassword(value){
    const data=new TextEncoder().encode(value);
    const hashBuffer=await crypto.subtle.digest('SHA-256',data);
    return Array.from(new Uint8Array(hashBuffer)).map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

password.addEventListener('input',validatePassword);
submitButton.disabled=true;

bio.addEventListener('input',()=>{
    bioCount.textContent=bio.value.length;
});

fileInput.addEventListener('change',()=>{
    const file=fileInput.files[0];
    if(!file){
        fileLabel.textContent='Upload certification';
        return;
    }
    if(file.size>5*1024*1024){
        alert('The selected file is larger than 5 MB.');
        fileInput.value='';
        fileLabel.textContent='Upload certification';
        return;
    }
    fileLabel.textContent=file.name;
});

form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!isPasswordSecure(password.value)){
        alert("Your password does not meet SENYA's security requirements.");
        password.focus();
        validatePassword();
        return;
    }
    const languages=[...document.querySelectorAll('input[name="language"]:checked')].map(input=>input.value);
    if(!languages.length){
        alert('Please select at least one language or communication method.');
        return;
    }
    const specialties=[...document.querySelectorAll('input[name="specialty"]:checked')].map(input=>input.value);
    if(!specialties.length){alert('Please select at least one specialty.');return;}
    const email=document.getElementById('email').value.trim().toLowerCase();
    submitButton.disabled=true;
    try {
        const registration=await Senya.signUp(email,password.value,{
            role:'interpreter',firstName:document.getElementById('firstName').value.trim(),
            lastName:document.getElementById('lastName').value.trim(),phone:document.getElementById('phone').value.trim(),
            experience:Number(document.getElementById('experience').value),certification:document.getElementById('certification').value.trim(),
            languages,specialties,bio:bio.value.trim()
        });
        form.hidden=true; success.hidden=false;
        success.querySelector('p').textContent=registration.access_token?'Account created. You can sign in and upload your certificate. SENYA must verify your interpreter profile before you receive appointments.':'Check your email to confirm your account. SENYA must verify your credentials before you can receive appointments.';
    } catch(e) { Senya.error(e); } finally { submitButton.disabled=false; }
});

fileInput.disabled=true; fileLabel.textContent="Upload your certificate from your profile after confirming your email.";
