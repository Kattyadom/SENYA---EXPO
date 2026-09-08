const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
for(const page of ['profile.html','request.html?type=scheduled'])test('guest sees a sign-in dialog for '+page,()=>{
 let click,dialog;const storage=new Map(),window={};const parts={h2:{},p:{},'[data-cancel]':{},'[data-signin]':{}};
 const document={getElementById:()=>dialog,createElement:()=>({setAttribute(){},querySelector:key=>parts[key],addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}),body:{append:el=>dialog=el},addEventListener:(_,fn)=>click=fn};
 const sessionStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../EXPO/js/auth-gate.js'),'utf8'),{document,window,sessionStorage,URL,location:{href:'https://senya.test/index.html',origin:'https://senya.test'}});
 let prevented=false;click({target:{closest:()=>({href:'https://senya.test/'+page})},preventDefault(){prevented=true;},stopImmediatePropagation(){}});
 assert.equal(prevented,true);assert.equal(dialog.open,true);assert.match(parts.p.textContent,/Please sign in/);parts['[data-signin]'].onclick();assert.equal(storage.get('senyaLoginDestination'),page);
 parts['[data-cancel]'].onclick();assert.equal(dialog.open,false);
 storage.set('senyaAuth',JSON.stringify({access_token:'token',user:{id:'user'}}));prevented=false;click({target:{closest:()=>({href:'https://senya.test/'+page})},preventDefault(){prevented=true;},stopImmediatePropagation(){}});assert.equal(prevented,false);
});
