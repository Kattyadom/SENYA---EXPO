// Route legacy call buttons through the appointment flow, preserving service context.
document.addEventListener('click',event=>{
 const button=event.target.closest('.call-now,.btn-call');if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 const card=button.closest('.service-card,.bank-card,.card,article');
 const title=card?.querySelector('h2,h3')||document.querySelector('main h1,main h2,h1');
 const service=(title?.textContent||'General Service').trim();
 const params=new URLSearchParams({service});
 if(button.dataset.schedule==='true'){
  params.set('type','scheduled');
  const label=button.dataset.specialty||card?.querySelector('.category')?.textContent||'';
  const specialty=/health/i.test(label)?'Healthcare':/bank/i.test(label)?'Banking':/telecom/i.test(label)?'Telecommunications':/utilit/i.test(label)?'Utilities':/government/i.test(label)?'Government':null;
  if(specialty)params.set('specialty',specialty);
 }
 location.href='request.html?'+params.toString();
},true);
