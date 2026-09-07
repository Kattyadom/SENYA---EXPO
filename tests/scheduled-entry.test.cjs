const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('user request tracking exposes a join link only within the scheduled window',async()=>{
 const element=()=>({style:{},removeAttribute(name){delete this[name];},after(){}});
 const elements={};let ready,poll,link;
 const now=Date.now();let request={id:'test',status:'accepted',scheduled_at:new Date(now+15*60000).toISOString()};
 const document={addEventListener:(_,fn)=>ready=fn,querySelector:key=>elements[key]??=element(),getElementById:key=>elements[key]??=element(),createElement:()=>link=element()};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../EXPO/js/espera.js'),'utf8'),{document,URLSearchParams,location:{search:'?id=test'},Date,Senya:{me:async()=>({}),poll:fn=>poll=fn,rpc:async name=>name==='sync_requests'?[request]:[],error:e=>{throw e;}}});
 await ready();await poll();assert.equal(link.hidden,true);assert.equal(link.style.display,'none');assert.equal(link.href,undefined);
 request.scheduled_at=new Date(now+9*60000).toISOString();await poll();assert.equal(link.hidden,false);assert.match(link.href,/videollamada/);
 request.status='cancelled';await poll();assert.equal(link.style.display,'none');assert.equal(link.href,undefined);
});
