const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
for(const role of ['user','interpreter'])test('unified profile isolates '+role+' information and preserves preferences',async()=>{
 const elements={};const get=id=>elements[id]??={hidden:true,value:'',scrollIntoView(){}};let ready,professionalReads=0,saved;
 const profile={id:'account',role,first_name:'Test',last_name:'Account',preferences:{largeText:true}};
 const Senya={me:async()=>profile,select:async table=>{assert.equal(table,'interpreter_profiles');professionalReads++;return [{languages:['LESSA'],specialties:['General'],experience:2,verification_status:'pending'}];},rpc:async(name,args)=>{saved=args;},error:e=>{throw e;}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../EXPO/js/account-profile.js'),'utf8'),{document:{getElementById:get,addEventListener:(_,fn)=>ready=fn},Senya,sessionStorage:{getItem:()=>JSON.stringify({user:{email:'test@example.com'}})},location:{hash:''}});
 await ready();assert.equal(professionalReads,role==='interpreter'?1:0);assert.equal(get('professionalCard').hidden,role!=='interpreter');assert.equal(get('userCard').hidden,role!=='user');
 await get('accountForm').onsubmit({preventDefault(){}});assert.equal(saved.p_preferences.largeText,true);assert.equal(saved.p_first_name,'Test');assert.equal(saved.role,undefined);
});
