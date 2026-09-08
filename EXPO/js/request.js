document.addEventListener('DOMContentLoaded',async()=>{
 const params=new URLSearchParams(location.search);
 const service=params.get('service')||'';
 const specialty=params.get('specialty');
 if(['Banking','Healthcare','Government','Telecommunications','Utilities','General'].includes(specialty))document.getElementById('specialty').value=specialty;
 const serviceInput=document.getElementById('serviceName');serviceInput.value=service;
 const updateService=()=>document.getElementById('selectedService').textContent=serviceInput.value.trim()||'Choose your service below';updateService();serviceInput.addEventListener('input',updateService);
 const form=document.getElementById('requestForm'),button=form.querySelector('[type=submit]');button.disabled=true;
 try{await Senya.me('user');button.disabled=false;}catch(e){Senya.error(e);}
 const type=document.getElementById('requestType'),date=document.getElementById('scheduledAt');
 type.onchange=()=>{date.parentElement.hidden=type.value!=='scheduled';date.required=type.value==='scheduled';};
 type.value=params.get('type')==='scheduled'?'scheduled':'immediate';type.onchange();
 const id=crypto.randomUUID();
 form.onsubmit=async e=>{e.preventDefault();button.disabled=true;try{
 const scheduled=type.value==='scheduled'?new Date(date.value).toISOString():null;
 const name=serviceInput.value.trim();if(!name)throw Error('Enter the service or organization you need help with.');
 const result=await Senya.rpc('create_request',{p_id:id,p_service:name,p_language:document.getElementById('languageType').value,p_specialty:document.getElementById('specialty').value,p_details:document.getElementById('details').value,p_scheduled_at:scheduled});
 location.href='espera.html?id='+encodeURIComponent(result);
 }catch(err){Senya.error(err);}finally{button.disabled=false;}};
});
