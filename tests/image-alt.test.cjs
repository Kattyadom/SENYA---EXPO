const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('every static image has a nonempty alternative text',()=>{
 const root=path.join(__dirname,'../EXPO');let count=0;
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){for(const image of fs.readFileSync(path.join(root,file),'utf8').matchAll(/<img\b[^>]*>/gi)){count++;assert.match(image[0],/\balt\s*=\s*["'][^"']\S*[^"']*["']/i,file);}}
 assert.ok(count>0);
});
