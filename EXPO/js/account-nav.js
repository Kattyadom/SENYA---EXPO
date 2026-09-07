
document.addEventListener('DOMContentLoaded',async()=>{
 const old=document.querySelector('header.navbar');
 const header=document.createElement('header');header.className='navbar';header.id='senyaHeader';header.innerHTML='<div class="navbar-container"><a class="logo" href="index.html"><img src="img/Senyalogo.png" alt="SENYA"></a><nav id="senyaNavigation" aria-label="Main navigation"><ul class="nav-links"></ul></nav><div class="right-actions"><button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="senyaNavigation"><span aria-hidden="true">☰</span></button></div></div>';
 if(old)old.replaceWith(header);else document.body.prepend(header);
 const nav=header.querySelector('.nav-links');header.querySelector('button').onclick=e=>{const open=header.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));};
 let role=null;try{if(sessionStorage.getItem('senyaAuth')){const [p]=await Senya.select('profiles');role=p?.role;}}catch(e){Senya.error(e);}
 const path=location.pathname.split('/').pop()||'index.html';
 const entries=role==='interpreter'?[['My appointments','interpreter-dashboard.html'],['My profile','profile.html'],['Support','soporte.html']]:role==='user'?[['My appointments','appointments.html'],['Request assistance','request.html'],['My profile','profile.html'],['Support','soporte.html']]:role==='admin'?[['Applications','admin.html'],['My profile','profile.html']]:[['Home','index.html'],['Partner network','opciones.html'],['About us','about.html'],['Contact','soporte.html'],['Sign in','signin.html']];
 for(const [label,href] of entries){const a=document.createElement('a');a.textContent=label;a.href=href;if(path===href||(href==='profile.html'&&path==='interpreter-profile.html')){a.setAttribute('aria-current','page');a.classList.add('active');}const li=document.createElement('li');li.append(a);nav.append(li);}
 if(document.getElementById('accessibilityPanel')){const b=document.createElement('button');b.textContent='Accessibility';b.id='accessibilityBtn';b.className='help-btn';b.onclick=()=>{document.getElementById('accessibilityPanel').classList.toggle('open');};header.querySelector('.right-actions').prepend(b);}
 if(role){const b=document.createElement('button');b.textContent='Log out';b.onclick=()=>Senya.signout();const li=document.createElement('li');li.append(b);nav.append(li);}
});
