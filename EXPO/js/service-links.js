// Route legacy call buttons through the appointment flow, preserving service context.
document.addEventListener('click',event=>{
 const button=event.target.closest('.call-now,.btn-call');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 const card=button.closest('.service-card,.bank-card,.card,article');
 const title=card?.querySelector('h2,h3')||document.querySelector('main h1,main h2,h1');
 const service=(title?.textContent||'General Service').trim();
 location.href='request.html?service='+encodeURIComponent(service);
},true);
