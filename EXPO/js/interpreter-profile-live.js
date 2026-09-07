document.addEventListener('DOMContentLoaded',async()=>{
 try{
 const p=await Senya.me('interpreter'),[ip]=await Senya.select('interpreter_profiles');
 const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
 set('profileName',p.first_name+' '+p.last_name);set('profileEmail',JSON.parse(sessionStorage.getItem('senyaAuth')).user.email);set('profilePhone',p.phone);set('profileExperience',ip.experience+' years');set('profileCertification',ip.certification+' ('+ip.verification_status+')');set('profileBio',ip.bio);
 document.getElementById('editProfileButton').hidden=true;
 const toggle=document.getElementById('availabilitySwitch');toggle.checked=ip.available;toggle.disabled=true;set('availabilityText','Manage availability in your dashboard');
 const section=document.createElement('section');section.id='certificate-upload';const heading=document.createElement('h2');heading.textContent='Certificate verification';section.append(heading);section.style.cssText='padding:24px;margin:24px;background:#fff;border-radius:20px;color:#1e293b';
 const description=document.createElement('p');description.textContent='Languages: '+ip.languages.join(', ')+' · Specialties: '+ip.specialties.join(', ');section.append(description);
 const label=document.createElement('label');label.textContent='Upload your certification for review (PDF, JPG or PNG; up to 5 MB)';const input=document.createElement('input');input.type='file';input.id='certificateFile';input.style.cssText='display:block;margin-top:12px;max-width:100%';input.accept='.pdf,.jpg,.jpeg,.png';label.append(input);section.append(label);
 const message=document.createElement('p');message.setAttribute('role','status');section.append(message);
 input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>5242880||!['application/pdf','image/jpeg','image/png'].includes(file.type)){message.textContent='Choose a PDF, JPG or PNG under 5 MB.';return;}input.disabled=true;try{const c=await Senya.settings();const ext={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'}[file.type];const res=await fetch(c.url+'/storage/v1/object/certificates/'+p.id+'/'+crypto.randomUUID()+'.'+ext,{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+await Senya.token(),'Content-Type':file.type},body:file});if(!res.ok)throw Error('Upload failed. Please try again.');message.textContent='Certificate uploaded. SENYA will review it before enabling your account.';}catch(e){message.textContent=e.message;}finally{input.disabled=false;}};
 (document.querySelector('main')||document.body).prepend(section);if(location.hash==='#certificate-upload')section.scrollIntoView({block:'start'});
 }catch(e){Senya.error(e);}
});
