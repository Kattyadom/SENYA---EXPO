document.addEventListener('DOMContentLoaded',async()=>{
 const get=id=>document.getElementById(id);
 let p;
 const theme=()=>{document.body.classList.toggle('light-theme',localStorage.getItem('theme')==='light');get('themeStatusText').textContent=document.body.classList.contains('light-theme')?'Light theme (Active)':'Dark theme (Active)';};theme();
 get('themeToggleBtn').onclick=()=>{localStorage.setItem('theme',document.body.classList.contains('light-theme')?'dark':'light');theme();};
 get('logoutBtn').onclick=()=>Senya.signout();
 try{p=await Senya.me('user');}catch(e){Senya.error(e);return;}
 const fields={firstName:'first_name',lastName:'last_name',phone:'phone',birth:'birthday',whatsapp:'whatsapp',address:'address'};
 for(const [id,key] of Object.entries(fields))get(id).value=p[key]||'';
 get('email').value=JSON.parse(sessionStorage.getItem('senyaAuth')).user.email;
 get('displayName').textContent=p.first_name+' '+p.last_name;
 for(const el of document.querySelectorAll('input[type=checkbox]'))el.checked=p.preferences[el.id]??el.checked;
 const photoKey='profileImage_'+p.id;const photo=localStorage.getItem(photoKey);get('previewImage').src=photo||'img/Senyalogo.png';
 get('imageUpload').onchange=e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>2000000)return Senya.error(Error('Choose an image under 2 MB.'));const reader=new FileReader();reader.onload=()=>{get('previewImage').src=reader.result;try{localStorage.setItem(photoKey,reader.result);}catch{Senya.error(Error('Could not save the photo on this device.'));}};reader.readAsDataURL(f);};
 async function save(){const prefs={};document.querySelectorAll('input[type=checkbox]').forEach(el=>prefs[el.id]=el.checked);await Senya.rpc('save_profile',{p_first_name:get('firstName').value,p_last_name:get('lastName').value,p_phone:get('phone').value,p_birthday:get('birth').value,p_whatsapp:get('whatsapp').value,p_address:get('address').value,p_preferences:prefs});get('displayName').textContent=get('firstName').value+' '+get('lastName').value;}
 document.querySelectorAll('.edit-btn').forEach(b=>b.onclick=async()=>{const inputs=b.closest('.card').querySelectorAll('input:not([type=email])');if(b.dataset.editing){b.disabled=true;try{await save();inputs.forEach(i=>i.disabled=true);delete b.dataset.editing;b.textContent='Edit';}catch(e){Senya.error(e);}finally{b.disabled=false;}}else{inputs.forEach(i=>i.disabled=false);b.dataset.editing='1';b.textContent='Save';}});
 for(const id of ['saveCommunication','saveAccessibility'])get(id).onclick=async()=>{try{await save();get(id).textContent='Saved';}catch(e){Senya.error(e);}};
 get('history').replaceChildren();const title=document.createElement('h2');title.textContent='Appointment history';const link=document.createElement('a');link.href='appointments.html';link.textContent='View your appointments and sessions';get('history').append(title,link);
});
