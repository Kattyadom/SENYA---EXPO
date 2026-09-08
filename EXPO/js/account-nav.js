
function renderAccountNav(){
 const header=document.getElementById('senyaHeader');if(!header)return;
 // Add space only when the first visible content would overlap the fixed bar.
 const protectContent=()=>{const content=document.querySelector('main,.hero,body > section');if(!content)return;const first=[...content.querySelectorAll('h1,h2,p,a,input')].find(el=>el.getClientRects().length);if(!first)return;const needed=header.getBoundingClientRect().bottom+16-first.getBoundingClientRect().top;if(needed>0&&scrollY===0){const padding=parseFloat(getComputedStyle(content).paddingTop)||0;content.style.paddingTop=(padding+needed)+'px';}};
 requestAnimationFrame(protectContent);window.addEventListener('load',protectContent,{once:true});
 const nav=header.querySelector('.nav-links');const menuButton=header.querySelector('.menu-toggle');menuButton.setAttribute('aria-controls','senyaSignMenu');
 const role=header.dataset.role||'user';
 document.getElementById('senyaSignMenu')?.remove();menuButton.classList.toggle('interpreter-mobile-menu',role==='interpreter');
 const path=location.pathname.split('/').pop()||'index.html';
 const entries=role==='interpreter'?[['Home','interpreter-home.html'],['My appointments','interpreter-dashboard.html'],['Profile','profile.html'],['About us','about.html'],['Contact','soporte.html']]:role==='admin'?[['Applications','admin.html'],['Profile','profile.html']]:[['Home','index.html'],['Partner network','opciones.html'],['Profile','profile.html'],['About us','about.html'],['Contact','soporte.html']];
 if(role==='interpreter'){header.querySelector('.logo').href='interpreter-home.html';document.body.classList.add('interpreter-view');setupInterpreterAccessibility();}

 nav.replaceChildren();
 for(const [label,href] of entries){const a=document.createElement('a');a.textContent=label;a.href=href;if(path===href||(href==='profile.html'&&path==='interpreter-profile.html')){a.setAttribute('aria-current','page');a.classList.add('active');}const li=document.createElement('li');li.append(a);nav.append(li);}
 const access=header.querySelector('#accessibilityBtn');access.onclick=()=>document.getElementById('accessibilityPanel')?.classList.add('open');
 if(role==='interpreter'){menuButton.classList.add('interpreter-mobile-menu');}
 const panel=document.createElement('div');panel.id='senyaSignMenu';panel.className='sign-language-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Navigation');panel.innerHTML='<div class="sign-panel-header"><h2>Explore SENYA</h2><button class="sign-close-btn" aria-label="Close menu">×</button></div><div class="sign-panel-content"></div>';
 const videos={'index.html':'home','opciones.html':'network','profile.html':'perfil','about.html':'about','soporte.html':'contact'};
 for(const [label,href] of entries){const a=document.createElement('a');a.className='sign-video-card';a.href=href;const videoName=role==='interpreter'||role==='admin'?null:videos[href];if(videoName){const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='metadata';video.src='videos/'+videoName+'.mp4';a.append(video);}a.setAttribute('aria-label',label);if(role==='interpreter'||role==='admin'){const text=document.createElement('span');text.textContent=label;a.append(text);}panel.querySelector('.sign-panel-content').append(a);}
 document.body.append(panel);const close=()=>{panel.hidden=true;panel.classList.remove('open');document.body.classList.remove('sign-menu-open');menuButton.setAttribute('aria-expanded','false');panel.querySelectorAll('video').forEach(v=>v.pause());menuButton.focus();};menuButton.onclick=()=>{panel.hidden=false;panel.classList.add('open');document.body.classList.add('sign-menu-open');menuButton.setAttribute('aria-expanded','true');panel.querySelectorAll('video').forEach(v=>v.play().catch(()=>{}));panel.querySelector('button').focus();};panel.querySelector('button').onclick=close;panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,a')];const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
}
document.addEventListener('DOMContentLoaded',()=>{
 renderAccountNav();
 // Keep the initial navbar visible while checking the actual account role.
 if(sessionStorage.getItem('senyaAuth'))Senya.select('profiles').then(([profile])=>{
  if(!profile)return;
  sessionStorage.setItem('senyaNavRole',JSON.stringify({id:profile.id,role:profile.role}));
  const header=document.getElementById('senyaHeader');
  if(header&&header.dataset.role!==profile.role){header.dataset.role=profile.role;renderAccountNav();}
 }).catch(()=>{});
});

function setupInterpreterAccessibility(){
 let panel=document.getElementById('accessibilityPanel');
 const language=document.getElementById('google_translate_element');
 if(!panel){panel=document.createElement('aside');panel.id='accessibilityPanel';document.body.append(panel);}
 panel.className='accessibility-panel interpreter-accessibility';
 panel.innerHTML='<div class="panel-header"><h3>Accessibility</h3><button type="button" aria-label="Close accessibility">×</button></div><div class="panel-content"><section><h4>Change theme</h4><button type="button" id="interpreterTheme" aria-pressed="false">Dark theme</button></section><section><h4>Text size</h4><div class="size-buttons"><button type="button" data-size="small">A−</button><button type="button" data-size="normal">A</button><button type="button" data-size="large">A+</button></div></section><section><h4>Language</h4><div id="interpreterLanguage"></div></section></div>';
 panel.querySelector('.panel-header button').onclick=()=>panel.classList.remove('open');
 const theme=panel.querySelector('#interpreterTheme');const applyTheme=()=>{const dark=localStorage.getItem('senyaInterpreterTheme')==='dark';document.body.classList.toggle('interpreter-dark',dark);theme.textContent=dark?'Light theme':'Dark theme';theme.setAttribute('aria-pressed',String(dark));};applyTheme();theme.onclick=()=>{localStorage.setItem('senyaInterpreterTheme',document.body.classList.contains('interpreter-dark')?'light':'dark');applyTheme();};
 const applySize=size=>{document.body.classList.remove('text-small','text-large');if(size!=='normal')document.body.classList.add('text-'+size);panel.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.size===size)));};applySize(localStorage.getItem('senyaInterpreterTextSize')||'normal');panel.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{localStorage.setItem('senyaInterpreterTextSize',b.dataset.size);applySize(b.dataset.size);});
 const host=panel.querySelector('#interpreterLanguage');if(language)host.append(language);else{const div=document.createElement('div');div.id='google_translate_element';host.append(div);}
 const init=()=>{if(!document.querySelector('#google_translate_element select')&&window.google?.translate?.TranslateElement)new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,es',autoDisplay:false},'google_translate_element');};
 if(window.google?.translate?.TranslateElement)init();else if(!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')){window.senyaInterpreterTranslateReady=init;const script=document.createElement('script');script.src='https://translate.google.com/translate_a/element.js?cb=senyaInterpreterTranslateReady';script.onerror=()=>{host.textContent='Language options are unavailable. Please reload to try again.';};document.head.append(script);}
}
