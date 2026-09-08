document.addEventListener('DOMContentLoaded',async()=>{
 const home=document.getElementById('homeAppointments');
 if(home&&!window.SenyaLogin?.signedIn())return;
 const interpreter=document.body.dataset.role==='interpreter';
 const list=document.getElementById('appointmentList');
 const theme=()=>{if(!home)document.body.classList.toggle('light-theme',localStorage.getItem('theme')==='light');};theme();
 if(document.getElementById('themeButton'))document.getElementById('themeButton').onclick=()=>{localStorage.setItem('theme',document.body.classList.contains('light-theme')?'dark':'light');theme();};
 if(document.getElementById('logoutButton'))document.getElementById('logoutButton').onclick=()=>Senya.signout();
 let profile,busy=false,signature='';
 try{
 if(home){[profile]=await Senya.select('profiles');if(profile?.role!=='user')return;home.hidden=false;const welcome=document.getElementById('homeWelcome');if(welcome)welcome.textContent=profile.first_name?.trim()?'Welcome, '+profile.first_name.trim():'Welcome';}else profile=await Senya.me(interpreter?'interpreter':'user');
 if(document.getElementById('accountName'))document.getElementById('accountName').textContent=profile.first_name+' '+profile.last_name;
 if(document.getElementById('initials'))document.getElementById('initials').textContent=(profile.first_name[0]||'')+(profile.last_name[0]||'');
 if(interpreter){
 const [ip]=await Senya.select('interpreter_profiles');
 const input=document.getElementById('availabilitySwitch');input.checked=ip.available;input.disabled=ip.verification_status!=='verified';
 document.getElementById('availabilityMessage').textContent=ip.verification_status==='verified'?'Keep this dashboard open to receive offers. Offers expire after 90 seconds.':'Your profile is '+ip.verification_status+'. SENYA must verify your credentials before you receive requests.';
 if(document.getElementById('skills'))document.getElementById('skills').textContent=ip.languages.join(' · ')+' / '+ip.specialties.join(' · ');
 input.onchange=async()=>{input.disabled=true;try{await Senya.rpc('set_availability',{p_available:input.checked});}catch(e){input.checked=!input.checked;Senya.error(e);}finally{input.disabled=false;}};
 }
 }catch(e){Senya.error(e);return;}
 function node(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function button(label,action,id,cls=''){const b=node('button',label,cls);b.onclick=async()=>{if(busy)return;busy=true;b.disabled=true;try{await Senya.rpc('respond_request',{p_id:id,p_action:action});signature='';await refresh();}catch(e){Senya.error(e);}finally{busy=false;b.disabled=false;}};return b;}
 async function refresh(){
 const allRows=await Senya.rpc('sync_requests');
 const hidden=profile.preferences?.hidden_appointment_ids||[];
 const rows=allRows.filter(r=>interpreter||!['completed','cancelled'].includes(r.status)||!hidden.includes(r.id));
 document.getElementById('pendingCount').textContent=rows.filter(r=>['waiting','assigned'].includes(r.status)).length;
 document.getElementById('activeCount').textContent=rows.filter(r=>['accepted','in_progress'].includes(r.status)).length;
 document.getElementById('completedCount').textContent=rows.filter(r=>r.status==='completed').length;
 const next=JSON.stringify(rows)+Math.floor(Date.now()/60000);if(signature===next)return;signature=next;list.replaceChildren();
 if(!rows.length){list.append(node('p',interpreter?'No assistance assigned yet. Set yourself as available and SENYA will find requests that match your skills.':'You have no appointments yet. Choose a service to request an interpreter.','empty'));return;}
 for(const r of rows){
 const card=node('article',null,'appointment'),head=node('div',null,'card-head');
 head.append(node('h3',r.service),node('span',r.status.replace('_',' '),'status-pill'));card.append(head);
 card.append(node('p',r.language+' · '+r.specialty+' · '+(r.scheduled_at?new Date(r.scheduled_at).toLocaleString():'Immediate assistance')));
 card.append(node('p',r.details));const actions=node('div',null,'actions');
 if(interpreter&&r.status==='assigned'){actions.append(button('Accept appointment','accept',r.id,'primary'),button('Decline','decline',r.id,'danger'));}
 if(['accepted','in_progress'].includes(r.status)){
 if(!r.scheduled_at||Date.parse(r.scheduled_at)<=Date.now()+600000){const join=node('a','Join session','action primary');join.href='videollamada.html?id='+encodeURIComponent(r.id);actions.append(join);}else{actions.append(node('p','The room opens 10 minutes before the appointment.'));}
 if(r.status==='in_progress')actions.append(button('Finish session','finish',r.id));
 }
 if(!interpreter&&['waiting','assigned','accepted'].includes(r.status)){const track=node('a','View request','action');track.href='espera.html?id='+encodeURIComponent(r.id);actions.append(track,button('Cancel appointment','cancel',r.id,'danger'));}
 if(home&&!interpreter&&['completed','cancelled'].includes(r.status)){
 const remove=node('button',null,'delete-appointment');remove.type='button';remove.title='Remove from my history';remove.setAttribute('aria-label','Remove '+r.service+' from my history');
 remove.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
 remove.onclick=async()=>{if(busy)return;busy=true;remove.disabled=true;try{
 const [latest]=await Senya.select('profiles');if(!latest||latest.id!==profile.id)throw new Error('Please sign in again.');
 const preferences={...latest.preferences,hidden_appointment_ids:[...new Set([...(latest.preferences?.hidden_appointment_ids||[]),r.id])]};
 await Senya.rpc('save_profile',{p_first_name:latest.first_name,p_last_name:latest.last_name,p_phone:latest.phone,p_birthday:latest.birthday,p_whatsapp:latest.whatsapp,p_address:latest.address,p_preferences:preferences});
 profile={...latest,preferences};signature='';await refresh();
 }catch(e){Senya.error(e);}finally{busy=false;remove.disabled=false;}};
 actions.append(remove);
 }
 card.append(actions);list.append(card);
 }
 }
 Senya.poll(refresh);
});
