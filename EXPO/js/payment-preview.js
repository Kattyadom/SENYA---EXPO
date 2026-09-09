(function(){
 'use strict';
 let accountId=null;
 const key=()=> 'senya-payment-preview:'+accountId;
 function receipts(){try{return JSON.parse(localStorage.getItem(key())||'[]').filter(r=>r&&typeof r.id==='string'&&Number.isInteger(r.cents));}catch(_){return [];}}
 const money=c=>'$'+(c/100).toFixed(2);
 function history(){
  if(!accountId)return;
  let box=document.getElementById('paymentHistory');
  if(!box){box=document.createElement('section');box.id='paymentHistory';box.className='senya-pricing-demo';(document.querySelector('main')||document.body).append(box);}
  box.replaceChildren();
  const h=document.createElement('h2');h.textContent='Payment history';box.append(h);
  const note=document.createElement('p');note.textContent='Simulated payments saved on this browser. No bank account is charged.';box.append(note);
  const rows=receipts();
  if(!rows.length){const p=document.createElement('p');p.textContent='No payments yet.';box.append(p);}
  for(const r of rows.slice().reverse()){
   const p=document.createElement('p');p.className='earnings-row';
   p.textContent=money(r.cents)+' USD · '+r.minutes+' minutes · Test card •••• 4242 · Simulated payment · '+new Date(r.date).toLocaleString();
   const a=document.createElement('a');a.href='espera.html?id='+encodeURIComponent(r.id);a.textContent='View appointment';
   p.append(document.createElement('br'),a);box.append(p);
  }
 }
 function init(id){accountId=id;history();}
 function confirm(plan){
  if(!accountId||!plan)return Promise.reject(Error('Please sign in again before continuing.'));
  const previouslyUsed=receipts().length>0;
  return new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.className='senya-payment-dialog';
   dialog.setAttribute('aria-labelledby','paymentTitle');
   dialog.innerHTML='<h2 id="paymentTitle">Confirm your payment</h2><p id="paymentAmount"></p><label for="paymentCard">Payment method</label><select id="paymentCard"><option value="approved">Test card •••• 4242</option><option value="declined">Test card •••• 0002 — declined payment</option></select><p id="paymentCardNote"></p><p>This checkout is simulated. Use the fictional cards provided; no real card details are collected.</p><p id="paymentMessage" role="status"></p><div class="payment-actions"><button type="button" id="paymentCancel">Back</button><button type="button" id="paymentConfirm"></button></div>';
   dialog.querySelector('#paymentAmount').textContent=plan.name+' · '+plan.minutes+' minutes · '+money(plan.cents)+' USD';
   dialog.querySelector('#paymentCardNote').textContent=previouslyUsed?'Your previously used test card is selected.':'Your test card will appear in your payment history after the appointment is created.';
   const pay=dialog.querySelector('#paymentConfirm');pay.textContent='Pay '+money(plan.cents);
   const finish=value=>{dialog.close();dialog.remove();resolve(value);};
   dialog.querySelector('#paymentCancel').onclick=()=>finish(false);
   dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
   pay.onclick=()=>{
    if(dialog.querySelector('#paymentCard').value==='declined'){
     dialog.querySelector('#paymentMessage').textContent='Payment declined. Choose another test card and try again. Your appointment has not been submitted.';return;
    }
    pay.disabled=true;finish(true);
   };
   document.body.append(dialog);dialog.showModal();
  });
 }
 function record(id,plan){
  if(!accountId)return;
  const rows=receipts();if(rows.some(r=>r.id===id))return;
  rows.push({id,cents:plan.cents,minutes:plan.minutes,date:new Date().toISOString()});
  // A storage failure must not turn a successfully created appointment into an error.
  try{localStorage.setItem(key(),JSON.stringify(rows));}catch(_){}
 }
 window.SenyaPaymentPreview={init,confirm,record};
 if(location.pathname.endsWith('/profile.html'))document.addEventListener('DOMContentLoaded',async()=>{
  try{const p=await Senya.me();if(p.role==='user')init(p.id);}catch(_){}
 });
})();
