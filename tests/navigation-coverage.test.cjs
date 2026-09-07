const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('every HTML page shares the role navbar except authentication pages',()=>{
 const root=path.join(__dirname,'../EXPO');const excluded=new Set(['signin.html','login.html','SignUp.html','interpreter-register.html']);
 for(const file of fs.readdirSync(root).filter(name=>name.endsWith('.html'))){const html=fs.readFileSync(path.join(root,file),'utf8');const count=(html.match(/src="js\/account-nav\.js"/g)||[]).length;assert.equal(count,excluded.has(file)?0:1,file);if(!excluded.has(file))assert.match(html,/css\/account-ui\.css/,file);}
});
