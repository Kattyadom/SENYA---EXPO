(function(){
 // Restore the chosen language before Google's translator initializes.
 let language='en';
 try{language=localStorage.getItem('senyaLanguage')==='es'?'es':'en';}catch(_){}
 window.senyaAuthLanguage=language;
 // Remove stale translator cookies at host and parent-domain scopes.
 const domains=location.hostname.split('.');
 const scopes=[''];
 for(let i=0;i<domains.length-1;i++)scopes.push('; domain='+domains.slice(i).join('.'));
 const paths=new Set(['/']);
 const parts=location.pathname.split('/');
 for(let i=1;i<parts.length;i++)paths.add(parts.slice(0,i).join('/')||'/');
 for(const scope of scopes)for(const path of paths)document.cookie='googtrans=; Max-Age=0; path='+path+scope+'; SameSite=Lax';
 document.cookie='googtrans=/en/'+language+'; path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
 const style=document.createElement('style');
 style.textContent='#accessibilityPanel,#accessibilityBtn,#openPanel,#google_translate_element,.goog-te-banner-frame,.goog-te-menu-frame,.skiptranslate iframe{display:none!important}body{top:0!important}';
 document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{
  // Do not translate credentials or text the person enters into a form.
  document.querySelectorAll('input,textarea').forEach(el=>el.setAttribute('translate','no'));
  if(document.querySelector('script[src*="translate.google.com/translate_a/element.js"]'))return;
  if(language!=='es')return;
  const host=document.createElement('div');host.id='google_translate_element';host.hidden=true;document.body.append(host);
  window.senyaAuthTranslateReady=()=>{
   new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,es',autoDisplay:false},host.id);
  };
  const script=document.createElement('script');script.src='https://translate.google.com/translate_a/element.js?cb=senyaAuthTranslateReady';document.head.append(script);
 });
})();
