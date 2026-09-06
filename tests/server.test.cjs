const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');
delete process.env.SUPABASE_URL;delete process.env.SUPABASE_PUBLISHABLE_KEY;delete process.env.SUPABASE_ANON_KEY;
const {server}=require('../server.cjs');let base;
test.before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;});
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('dashboard and appointment routes exist',async()=>{for(const page of ['interpreter-dashboard.html','interpreter-dashboard-redesign.html','appointments.html','request.html','espera.html','signin.html'])assert.equal((await fetch(base+'/'+page)).status,200);});
test('configuration fails clearly before Supabase setup',async()=>{assert.equal((await fetch(base+'/api/config')).status,503);});
test('registration links and user profile navigation are consistent',async()=>{
 const signin=await(await fetch(base+'/signin.html')).text();assert.match(signin,/href="SignUp.html"/);assert.doesNotMatch(signin,/href="login.html"/);
 assert.equal((await fetch(base+'/SignUp.html')).status,200);
 const alias=await(await fetch(base+'/login.html')).text();assert.match(alias,/url=SignUp.html/);
 const profile=await(await fetch(base+'/profile.html')).text();assert.match(profile,/href="appointments.html">My appointments/);
});
test('private server and environment files are not served',async()=>{for(const name of ['server.js','server.cjs','.env','supabase/001_citas.sql','package.json'])assert.equal((await fetch(base+'/'+name)).status,404);});
test('socket rejects an unauthenticated caller',async()=>{
 const response=await fetch(base+'/socket.io/?EIO=4&transport=polling');const open=await response.text();const {sid}=JSON.parse(open.slice(1));
 const endpoint=base+'/socket.io/?EIO=4&transport=polling&sid='+sid;
 await fetch(endpoint,{method:'POST',body:'40{}',headers:{'Content-Type':'text/plain'}});
 const data=await(await fetch(endpoint)).text();assert.match(data,/44/);assert.match(data,/unavailable/);
 await fetch(endpoint,{method:'POST',body:'1',headers:{'Content-Type':'text/plain'}});
});
test('changed browser scripts parse',()=>{for(const name of ['senya-api','appointments','request','espera','signin','login','interpreter-register','session-call','profile-live','interpreter-profile-live','service-links'])execFileSync(process.execPath,['--check',path.join(__dirname,'../EXPO/js',name+'.js')]);});
test('new pages reference existing local scripts and styles',()=>{for(const page of ['appointments.html','interpreter-dashboard.html','request.html','espera.html','signin.html','profile.html','interpreter-profile.html','videollamada.html']){const html=fs.readFileSync(path.join(__dirname,'../EXPO',page),'utf8');for(const match of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g))assert.ok(fs.existsSync(path.join(__dirname,'../EXPO',match[1])),page+': '+match[1]);}});
