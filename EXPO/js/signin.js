document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('loginForm'),button=document.getElementById('signInButton');
 const registrationEmail=sessionStorage.getItem('senyaRegistrationEmail');
 if(registrationEmail){document.getElementById('email').value=registrationEmail;sessionStorage.removeItem('senyaRegistrationEmail');}
 const mailButtons=['recoverPassword','resendConfirmation'].map(id=>document.getElementById(id));
 let sending=false;
 for(const [id,method] of [['recoverPassword','recover'],['resendConfirmation','resend']])document.getElementById(id).onclick=async()=>{
  if(sending)return;
  const email=document.getElementById('email');if(!email.reportValidity())return;
  const status=document.getElementById('authHelpStatus');sending=true;mailButtons.forEach(b=>b.disabled=true);document.getElementById('senyaMessage')?.setAttribute('hidden','');status.textContent='Sending request…';
  let sent=false;
  try{await Senya[method](email.value.trim().toLowerCase());sent=true;status.textContent='If this email belongs to an eligible account, you will receive a link. Open it on this computer and check your spam folder. Wait at least one minute before requesting another link.';}catch(e){status.textContent='';Senya.error(e);}finally{setTimeout(()=>{sending=false;mailButtons.forEach(b=>b.disabled=false);},sent?60000:0);}
 };
 document.getElementById('showPassword').onclick=()=>{const p=document.getElementById('password');p.type=p.type==='password'?'text':'password';};
 form.onsubmit=async e=>{e.preventDefault();button.disabled=true;document.getElementById('senyaMessage')?.setAttribute('hidden','');try{
 await Senya.signIn(document.getElementById('email').value.trim().toLowerCase(),document.getElementById('password').value);
 const p=await Senya.me();location.href=p.role==='admin'?'admin.html':p.role==='interpreter'?'interpreter-dashboard.html':'appointments.html';
 }catch(err){Senya.error(err);}finally{button.disabled=false;}};
});

