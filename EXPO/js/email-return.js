// Supabase may return an implicit session or an error in the URL fragment.
// Remove credentials from the URL and validate with Auth before reporting success.
document.addEventListener('DOMContentLoaded',async()=>{
 const params=new URLSearchParams(location.hash.slice(1));
 if(!params.has('access_token')&&!params.has('error')&&!params.has('error_description'))return;
 history.replaceState(null,'',location.pathname+location.search);
 const message=document.createElement('p');message.setAttribute('role','status');message.style.cssText='padding:16px;margin:16px 0;border-radius:12px;background:#eff6ff;color:#1e3a8a';
 (document.getElementById('loginForm')||document.querySelector('main')||document.body).prepend(message);
 if(params.has('error')||params.has('error_description')){message.textContent='This confirmation link is invalid or has expired. Try signing in if you already confirmed your email, or request a new confirmation email.';return;}
 message.textContent='Checking your email confirmation…';
 try{
  const c=await Senya.settings();const response=await fetch(c.url+'/auth/v1/user',{headers:{apikey:c.key,Authorization:'Bearer '+params.get('access_token')}});
  if(!response.ok)throw Error('Unable to verify this link. Try signing in with your email and password.');
  const user=await response.json();
  if(params.get('type')==='recovery'){
   const login=document.getElementById('loginForm');login.hidden=true;
   const form=document.createElement('form');form.className='recovery-form';
   const label=document.createElement('label');label.textContent='New SENYA password';
   const input=document.createElement('input');input.type='password';input.autocomplete='new-password';input.required=true;input.minLength=8;label.append(input);
   const hint=document.createElement('p');hint.textContent='Use at least 8 characters, an uppercase letter, a lowercase letter, a number and a symbol.';
   const button=document.createElement('button');button.type='submit';button.className='login-btn';button.textContent='Save new password';form.append(label,hint,button);login.after(form);
   message.textContent='Link verified. Create a new password.';form.prepend(message);
   form.onsubmit=async e=>{e.preventDefault();const value=input.value;if(!/[A-Z]/.test(value)||!/[a-z]/.test(value)||!/[0-9]/.test(value)||! /[^A-Za-z0-9]/.test(value)||value.length<8){message.textContent=hint.textContent;return;}button.disabled=true;
    try{const result=await fetch(c.url+'/auth/v1/user',{method:'PUT',headers:{apikey:c.key,Authorization:'Bearer '+params.get('access_token'),'Content-Type':'application/json'},body:JSON.stringify({password:value})});const data=await result.json();if(!result.ok)throw Error(data.msg||data.message||'Unable to change your password. Request a new link.');form.remove();login.hidden=false;message.textContent='Password updated. Sign in with your new password.';login.prepend(message);params.delete('access_token');params.delete('refresh_token');}
    catch(e){message.textContent=e.message;}finally{button.disabled=false;}
   };return;
  }
  message.textContent=user.email_confirmed_at?'Your email is confirmed. Sign in with your email and password to continue.':'Your email is not confirmed yet. Check the latest confirmation email.';
 }catch(e){message.textContent=e.message;}
});
