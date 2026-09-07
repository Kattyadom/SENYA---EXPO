document.addEventListener('DOMContentLoaded',async()=>{
 const id=new URLSearchParams(location.search).get('id');
 const title=document.querySelector('.connecting-card h2'),status=document.getElementById('estimatedWait');
 const cancel=document.querySelector('.cancel-btn');cancel.removeAttribute('onclick');cancel.disabled=true;
 const link=document.createElement('a');link.className='help-btn';link.textContent='Join session';link.hidden=true;link.style.display='none';status.after(link);
 try{await Senya.me('user');if(!id)throw Error('Choose an appointment from My appointments.');}catch(e){Senya.error(e);return;}
 cancel.onclick=async()=>{cancel.disabled=true;try{await Senya.rpc('respond_request',{p_id:id,p_action:'cancel'});location.href='appointments.html';}catch(e){Senya.error(e);cancel.disabled=false;}};
 Senya.poll(async()=>{
 const rows=await Senya.rpc('sync_requests'),r=rows.find(x=>x.id===id);if(!r)throw Error('Appointment unavailable.');
 document.getElementById('summaryService').textContent=r.service;document.getElementById('summaryLanguage').textContent=r.language;
 title.textContent=({waiting:'Finding your interpreter…',assigned:'Waiting for the interpreter to respond…',accepted:'Your interpreter accepted!',in_progress:'Your session is ready',cancelled:'Appointment cancelled',completed:'Session completed'})[r.status];
 status.textContent=r.status==='waiting'?'SENYA is searching by language, specialty and availability. Your request stays in the queue while no match is available.':r.scheduled_at?'Appointment: '+new Date(r.scheduled_at).toLocaleString():'You can follow this request in My appointments.';
 const canJoin=['accepted','in_progress'].includes(r.status)&&(!r.scheduled_at||Date.parse(r.scheduled_at)<=Date.now()+600000);
 link.hidden=!canJoin;link.style.display=canJoin?'':'none';
 if(canJoin)link.href='videollamada.html?id='+encodeURIComponent(id);else link.removeAttribute('href');
 if(!canJoin&&['accepted','in_progress'].includes(r.status))status.textContent+=' · The room opens 10 minutes before the appointment.';
 cancel.disabled=!['waiting','assigned','accepted'].includes(r.status);
 if(['accepted','in_progress'].includes(r.status)){const [contact]=await Senya.rpc('session_contact',{p_id:id});if(contact)title.textContent=contact.first_name+' '+contact.last_name+' is your interpreter';}
 document.getElementById('progressFill').style.width=({waiting:20,assigned:55,accepted:100,in_progress:100,completed:100,cancelled:0})[r.status]+'%';
 });
});
