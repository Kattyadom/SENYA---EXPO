document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('loginForm');
    const emailInput=document.getElementById('email');
    const passwordInput=document.getElementById('password');
    const showPassword=document.getElementById('showPassword');
    const rememberMe=document.getElementById('rememberMe');
    const signInButton=document.getElementById('signInButton');
    const message=document.getElementById('loginMessage');
    const messageText=document.getElementById('loginMessageText');
    const savedEmail=localStorage.getItem('senyaRememberEmail');
    if(savedEmail){emailInput.value=savedEmail;rememberMe.checked=true;}
    showPassword.addEventListener('click',()=>{
        const hidden=passwordInput.type==='password';
        passwordInput.type=hidden?'text':'password';
        showPassword.querySelector('i').className=hidden?'fa-regular fa-eye-slash':'fa-regular fa-eye';
    });
    function showMessage(text,type='error'){
        message.hidden=false;
        message.className=`login-message ${type}`;
        messageText.textContent=text;
    }
    function clearMessage(){message.hidden=true;message.className='login-message';messageText.textContent='';}
    async function hashPassword(value){
        const data=new TextEncoder().encode(value);
        const hashBuffer=await crypto.subtle.digest('SHA-256',data);
        return Array.from(new Uint8Array(hashBuffer)).map(byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    async function userPasswordMatches(user,enteredPassword){
        if(user.passwordHash)return await hashPassword(enteredPassword)===user.passwordHash;
        return user.password===enteredPassword;
    }
    async function interpreterPasswordMatches(application,enteredPassword){
        if(!application.passwordHash)return false;
        return await hashPassword(enteredPassword)===application.passwordHash;
    }
    function saveSession(account,role){
        const session={id:account.id,role,email:account.email,firstName:account.firstName||'',lastName:account.lastName||'',loginAt:new Date().toISOString()};
        localStorage.setItem('senyaSession',JSON.stringify(session));
        if(role==='user'){
            localStorage.setItem('senyaActiveUser',JSON.stringify(session));
            localStorage.removeItem('senyaActiveInterpreter');
        }else{
            localStorage.setItem('senyaActiveInterpreter',JSON.stringify(session));
            localStorage.removeItem('senyaActiveUser');
        }
    }
    form.addEventListener('submit',async event=>{
        event.preventDefault();
        clearMessage();
        const email=emailInput.value.trim().toLowerCase();
        const enteredPassword=passwordInput.value;
        if(!email||!enteredPassword){showMessage('Please enter your email and password.');return;}
        signInButton.disabled=true;
        signInButton.querySelector('span').textContent='Signing in...';
        try{
            const users=JSON.parse(localStorage.getItem('senyaUsers'))||[];
            const user=users.find(item=>(item.email||'').toLowerCase()===email);
            if(user&&await userPasswordMatches(user,enteredPassword)){
                rememberMe.checked?localStorage.setItem('senyaRememberEmail',email):localStorage.removeItem('senyaRememberEmail');
                saveSession(user,'user');
                showMessage('Welcome back! Opening your SENYA account...','success');
                setTimeout(()=>window.location.href='index.html',500);
                return;
            }
            const applications=JSON.parse(localStorage.getItem('senyaInterpreterApplications'))||[];
            const interpreter=applications.find(item=>(item.email||'').toLowerCase()===email);
            if(interpreter){
                if(!interpreter.passwordHash){showMessage('This interpreter application was created before secure sign-in was enabled. Create a new interpreter application for testing.','warning');return;}
                if(!await interpreterPasswordMatches(interpreter,enteredPassword)){showMessage('Email or password incorrect.');return;}
                const status=(interpreter.verificationStatus||'pending').toLowerCase();
                if(status==='pending'){showMessage('Your interpreter application is still under review. You can sign in after SENYA verifies your profile.','warning');return;}
                if(status==='rejected'){showMessage('Your interpreter application was not approved. Please contact SENYA support.','error');return;}
                if(status!=='verified'&&status!=='approved'){showMessage('Your interpreter account is not active yet.','warning');return;}
                rememberMe.checked?localStorage.setItem('senyaRememberEmail',email):localStorage.removeItem('senyaRememberEmail');
                saveSession(interpreter,'interpreter');
                showMessage('Welcome back! Opening your interpreter dashboard...','success');
                setTimeout(()=>window.location.href='interpreter-dashboard.html',500);
                return;
            }
            showMessage('Email or password incorrect.');
        }catch(error){
            console.error('SENYA sign-in error:',error);
            showMessage('Something went wrong while signing in. Please try again.');
        }finally{
            signInButton.disabled=false;
            signInButton.querySelector('span').textContent='Sign In';
        }
    });
});
