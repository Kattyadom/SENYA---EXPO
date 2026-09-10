(function(){
 let draft,dirty=false,loading=false,generation=0;
 const get=id=>document.getElementById(id);
 const valid=value=>typeof value==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)&&value.length<150000;
 function display(p){get('profileDisplayName').textContent=[p.first_name,p.last_name].filter(Boolean).join(' ')||'My account';}
 function render(){get('profilePhoto').src=valid(draft)?draft:'img/Senyalogo.png';}
 window.SenyaProfilePhoto={
  init(p){
   draft=p.preferences?.avatar;dirty=false;render();display(p);
   const input=get('profilePhotoFile'),remove=get('removeProfilePhoto');input.disabled=false;remove.disabled=false;
   const choose=get("chooseProfilePhoto");choose.disabled=false;choose.onclick=()=>input.click();
   input.onchange=async()=>{
    const file=input.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152){get('photoStatus').textContent='Choose a JPG, PNG or WebP up to 2 MB.';input.value='';return;}
    const token=++generation;loading=true;let bitmap;
    try{
     bitmap=await createImageBitmap(file);
     const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
     const context=canvas.getContext('2d');const size=Math.min(bitmap.width,bitmap.height);
     context.drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,256,256);
     const result=canvas.toDataURL('image/webp',0.8);if(!valid(result))throw Error('Please choose a smaller image.');
     if(token!==generation)return;
     draft=result;dirty=true;render();get('photoStatus').textContent='Photo ready. Select Save changes to update your account.';
    }catch(e){if(token===generation)get('photoStatus').textContent='Could not read this image. Choose another JPG, PNG or WebP.';}
    finally{bitmap?.close();if(token===generation)loading=false;input.value='';}
   };
   remove.onclick=()=>{++generation;loading=false;draft=null;dirty=true;render();get('photoStatus').textContent='Photo removed from preview. Save changes to confirm.';};
  },
  preferences(latest){if(loading)throw Error('Wait for your photo to finish loading.');const result={...latest};if(dirty){if(draft)result.avatar=draft;else delete result.avatar;}return result;},
  saved(p){display(p);if((p.preferences?.avatar||null)===(draft||null)){dirty=false;get('photoStatus').textContent='Your profile photo is saved.';}}
 };
})();
