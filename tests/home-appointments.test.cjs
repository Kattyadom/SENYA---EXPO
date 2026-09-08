const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../EXPO/js/appointments.js'),'utf8');
for(const role of ['guest','user','interpreter','admin'])test('Home appointments visibility: '+role,async()=>{
 const home={hidden:true,classList:{toggle(){}}};let init,polls=0,reads=0;
 const document={body:{dataset:{}},getElementById:id=>id==='homeAppointments'?home:id==='appointmentList'?{}:null,addEventListener:(_,fn)=>init=fn};
 vm.runInNewContext(source,{document,window:{SenyaLogin:{signedIn:()=>role!=='guest'}},localStorage:{getItem:()=>null},Senya:{select:async()=>{reads++;return [{role}]},poll:()=>polls++,error:e=>{throw e},me:()=>{throw Error('Home must not redirect guests')}}});await init();assert.equal(home.hidden,role!=='user');assert.equal(polls,role==='user'?1:0);assert.equal(reads,role==='guest'?0:1);
});
