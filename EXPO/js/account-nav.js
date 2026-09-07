
document.addEventListener('DOMContentLoaded',async()=>{
 const old=document.querySelector('header.navbar');
 const header=document.createElement('header');header.className='senya-nav';header.innerHTML='<a class="senya-brand" href="index.html">SENYA</a><button class="nav-toggle" aria-expanded="false" aria-controls="senyaNavigation">Menu</button><nav id="senyaNavigation" aria-label="Main navigation"></nav>';
 if(old)old.replaceWith(header);else document.body.prepend(header);
 const nav=header.querySelector('nav');header.querySelector('button').onclick=e=>{const open=header.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));};
 let role=null;try{if(sessionStorage.getItem('senyaAuth')){const [p]=await Senya.select('profiles');role=p?.role;}}catch(e){Senya.error(e);}
 const path=location.pathname.split('/').pop()||'index.html';
 const entries=role==='interpreter'?[['My appointments','interpreter-dashboard.html'],['My profile','profile.html'],['Support','soporte.html']]:role==='user'?[['My appointments','appointments.html'],['Request assistance','request.html'],['My profile','profile.html'],['Support','soporte.html']]:role==='admin'?[['Applications','admin.html'],['My profile','profile.html']]:[['Home','index.html'],['Partner network','opciones.html'],['About us','about.html'],['Contact','soporte.html'],['Sign in','signin.html']];
 for(const [label,href] of entries){const a=document.createElement('a');a.textContent=label;a.href=href;if(path===href||(href==='profile.html'&&path==='interpreter-profile.html'))a.setAttribute('aria-current','page');nav.append(a);}
 if(document.getElementById('accessibilityPanel')){const b=document.createElement('button');b.textContent='Accessibility';b.id='accessibilityBtn';b.onclick=()=>{document.getElementById('accessibilityPanel').classList.toggle('open');};nav.append(b);}
 if(role){const b=document.createElement('button');b.textContent='Log out';b.onclick=()=>Senya.signout();nav.append(b);const badge=document.createElement('span');badge.className='senya-role';badge.textContent=role==='interpreter'?'Interpreter account':role==='admin'?'Administrator':'User account';header.append(badge);}
});
