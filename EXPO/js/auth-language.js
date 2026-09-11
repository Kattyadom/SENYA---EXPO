(function(){
 // Restore the chosen language before Google's translator initializes.
 let language='en';
 try{language=localStorage.getItem('senyaLanguage')==='es'?'es':'en';}catch(_){}
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
