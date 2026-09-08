const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../EXPO/js/appointments.js'),'utf8');
for(const role of ['guest','user','interpreter','admin'])test('Home appointments visibility: '+role,async()=>{
 const home={hidden:true,classList:{toggle(){}}};let init,polls=0,reads=0;
 const document={body:{dataset:{}},getElementById:id=>id==='homeAppointments'?home:id==='appointmentList'?{}:null,addEventListener:(_,fn)=>init=fn};
 vm.runInNewContext(source,{document,window:{SenyaLogin:{signedIn:()=>role!=='guest'}},localStorage:{getItem:()=>null},Senya:{select:async()=>{reads++;return [{role}]},poll:()=>polls++,error:e=>{throw e},me:()=>{throw Error('Home must not redirect guests')}}});await init();assert.equal(home.hidden,role!=='user');assert.equal(polls,role==='user'?1:0);assert.equal(reads,role==='guest'?0:1);
});
test('history removal persists for the user without cancelling requests',async()=>{
 class Element{constructor(){this.children=[];this.classList={toggle(){}};}append(...x){this.children.push(...x)}replaceChildren(){this.children=[]}setAttribute(){} }
 const home=new Element();home.hidden=true;const list=new Element();const elements={homeAppointments:home,appointmentList:list,pendingCount:new Element(),activeCount:new Element(),completedCount:new Element()};let init,refresh,saved;const profile={id:'user-1',role:'user',first_name:'Test',last_name:'User',preferences:{existing:true}};
 const rows=[{id:'done',status:'completed',service:'Bank',language:'English',specialty:'Banking'},{id:'active',status:'accepted',service:'Clinic',language:'English',specialty:'Healthcare'}];
 vm.runInNewContext(source,{document:{body:{dataset:{}},getElementById:id=>elements[id]||null,createElement:()=>new Element(),addEventListener:(_,fn)=>init=fn},window:{SenyaLogin:{signedIn:()=>true}},localStorage:{getItem:()=>null},Senya:{select:async()=>[profile],poll:fn=>refresh=fn,error:e=>{throw e},rpc:async(name,args)=>{if(name==='sync_requests')return rows;assert.equal(name,'save_profile');saved=args;}}});
 await init();await refresh();assert.equal(list.children.length,2);const completedActions=list.children[0].children.at(-1);assert.equal(completedActions.children.length,1);const activeActions=list.children[1].children.at(-1);assert.ok(!activeActions.children.some(e=>e.className==='delete-appointment'));
 await completedActions.children[0].onclick();assert.equal(saved.p_preferences.existing,true);assert.deepEqual(Array.from(saved.p_preferences.hidden_appointment_ids),['done']);assert.equal(list.children.length,1);assert.equal(elements.completedCount.textContent,0);
});
