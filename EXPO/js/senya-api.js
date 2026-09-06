/* Requests live in Supabase; sessionStorage holds only the signed-in session. */
window.Senya = (() => {
 let config, refreshing;
 const key = 'senyaAuth';
 const read = () => { try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; } };
 async function settings() {
  if (!config) { const r=await fetch('/api/config'); if(!r.ok) throw new Error('SENYA is not configured yet. Please contact the administrator.'); config=await r.json(); }
  return config;
 }
 async function call(path,body,token,method) {
  const c=await settings();
  const r=await fetch(c.url+path,{method:method||(body?'POST':'GET'),headers:{apikey:c.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await r.json().catch(()=>null);
  if(!r.ok) { const error=new Error(data?.msg||data?.message||data?.error_description||'Unable to connect. Please try again.');error.code=data?.error_code||data?.code;throw error; }
  return data;
 }
 async function token() {
  let s=read(); if(!s) throw new Error('Please sign in to continue.');
  if(s.expires_at<Date.now()/1000+60) {
   if(!refreshing) refreshing=call('/auth/v1/token?grant_type=refresh_token',{refresh_token:s.refresh_token}).then(save).finally(()=>refreshing=null);
   s=await refreshing;
  }
  return s.access_token;
 }
 function save(s) { s.expires_at=s.expires_at||Date.now()/1000+s.expires_in; sessionStorage.setItem(key,JSON.stringify(s)); return s; }
 const rpc=async(name,args={})=>call('/rest/v1/rpc/'+name,args,await token());
 const select=async(table,query='')=>call('/rest/v1/'+table+'?select=*'+query,null,await token());
 async function me(role) {
  if(!read()) { location.href='signin.html'; throw new Error('Please sign in.'); }
  const [p]=await select('profiles'); if(!p) throw new Error('Account profile unavailable.');
  if(role&&p.role!==role) { location.href=p.role==='admin'?'admin.html':p.role==='interpreter'?'interpreter-dashboard.html':'appointments.html'; throw new Error('Opening your dashboard.'); }
  return p;
 }
 async function signout() { try { await call('/auth/v1/logout',{},await token()); } finally { sessionStorage.removeItem(key); for(const k of ['senyaSession','senyaActiveUser','senyaActiveInterpreter','usuarioActivo']) localStorage.removeItem(k); location.href='signin.html'; } }
 function error(e) {
  let el=document.getElementById('senyaMessage');
  if(!el){el=document.createElement('p');el.id='senyaMessage';el.setAttribute('role','alert');Object.assign(el.style,{padding:'16px',background:'#fff1f2',color:'#9f1239',borderRadius:'12px',margin:'16px 0',height:'auto',alignSelf:'start',fontSize:'14px'});(document.querySelector('#loginForm,#registerForm,#interpreterForm,form')||document.querySelector('main')||document.body).prepend(el);}
  const messages={invalid_credentials:'The email or password is incorrect. Use your SENYA password. If you cannot remember it, select Reset password.',email_not_confirmed:'Confirm your email before signing in. You can resend the confirmation link.',over_email_send_rate_limit:'The email sending limit has been reached. Please wait before requesting another link.',over_request_rate_limit:'Too many attempts. Please wait before trying again.',user_already_exists:'This account is already registered. Sign in or reset your password.'};
  el.hidden=false;el.textContent=messages[e.code]||(e.message==='Invalid login credentials'?messages.invalid_credentials:e.message)||String(e);
 }
 function poll(fn,delay=5000) { let stopped=false,t; async function tick(){try{await fn();}catch(e){error(e);}finally{if(!stopped)t=setTimeout(tick,delay);}} tick(); const stop=()=>{stopped=true;clearTimeout(t);};addEventListener('pagehide',stop,{once:true});return stop; }
 return {rpc,select,me,token,signout,error,poll,settings,
  signIn:async(email,password)=>save(await call('/auth/v1/token?grant_type=password',{email,password})),
  recover:email=>call('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/signin.html'),{email}),
  resend:email=>call('/auth/v1/resend',{type:'signup',email}),
  signUp:(email,password,data)=>call('/auth/v1/signup',{email,password,data})
 };
})();

