const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../EXPO'),source=fs.readFileSync(path.join(root,'js/account-nav.js'),'utf8');
test('user and interpreter menus match their dedicated destinations',()=>{
 const assignment=source.match(/const entries=([^;]+);/)[1];
 for(const [role,expected] of [['user',['index.html','opciones.html','profile.html','about.html','soporte.html']],['interpreter',['interpreter-home.html','interpreter-dashboard.html','profile.html','about.html','soporte.html']]]){
  const entries=vm.runInNewContext(assignment,{role});assert.deepEqual(Array.from(entries,e=>e[1]),expected);for(const [,href]of entries)assert.ok(fs.existsSync(path.join(root,href)));
 }
});
test('all five original video destinations point to existing files',()=>{
 const videos=vm.runInNewContext('('+source.match(/const videos=([^;]+);/)[1]+')');
 assert.equal(Object.keys(videos).length,5);for(const name of Object.values(videos))assert.ok(fs.existsSync(path.join(root,'videos',name+'.mp4')),name);
});

test('mobile menu copies use H.264 and fast-start metadata',()=>{
 for(const name of ['home','network','perfil','about','contact']){
 const data=fs.readFileSync(path.join(root,'videos',name+'-h264.mp4'));
 assert.ok(data.indexOf(Buffer.from('avc1'))>=0,name+' must use H.264');
 assert.ok(data.indexOf(Buffer.from('moov'))<data.indexOf(Buffer.from('mdat')),name+' must load metadata first');
 }
});
