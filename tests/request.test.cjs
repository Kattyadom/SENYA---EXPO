const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
test('immediate entry submits a persistent request without a scheduled date',async()=>{
 const elements={};const element=id=>elements[id]||(elements[id]={value:'',parentElement:{hidden:false},addEventListener(){}});
 const submit={disabled:false};element('requestForm').querySelector=()=>submit;
 const location={search:'?type=immediate',href:''};let ready,payload;
 const context={document:{getElementById:element,addEventListener:(_,fn)=>ready=fn},location,URLSearchParams,crypto:{randomUUID:()=> 'request-id'},Senya:{me:async()=>({role:'user'}),rpc:async(name,data)=>{assert.equal(name,'create_request');payload=data;return 'saved-id';},error:e=>{throw e;}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../EXPO/js/request.js'),'utf8'),context);await ready();
 assert.equal(elements.requestType.value,'immediate');assert.equal(elements.scheduledAt.required,false);assert.equal(elements.scheduledAt.parentElement.hidden,true);
 element('serviceName').value='BAC Credomatic';element('specialty').value='Banking';element('languageType').value='LESSA';element('details').value='Help opening an account';
 await elements.requestForm.onsubmit({preventDefault(){}});
 assert.equal(payload.p_scheduled_at,null);assert.equal(payload.p_service,'BAC Credomatic');assert.equal(payload.p_language,'LESSA');assert.equal(payload.p_specialty,'Banking');assert.equal(location.href,'espera.html?id=saved-id');
});
