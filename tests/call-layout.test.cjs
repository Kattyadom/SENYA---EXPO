const test=require('node:test');const assert=require('node:assert/strict');const configure=require('../EXPO/js/call-layout.js');
for(const role of ['user','interpreter'])test(role+': interpreter stays large and controls remain local',()=>{
 const elements=Object.fromEntries(['localVideo','remoteVideo','interpreterLabel','userLabel','cameraButton','micButton'].map(id=>[id,{id,setAttribute(k,v){this[k]=v;}}]));
 const panels={'.main-video':{prepend(video){this.video=video;}},'.self-video':{prepend(video){this.video=video;}}};
 configure({getElementById:id=>elements[id],querySelector:q=>panels[q]},role);
 assert.equal(panels['.main-video'].video.id,role==='interpreter'?'localVideo':'remoteVideo');
 assert.equal(panels['.self-video'].video.id,role==='interpreter'?'remoteVideo':'localVideo');
 assert.equal(elements.localVideo.muted,true);assert.equal(elements.remoteVideo.muted,false);
 assert.equal(elements.interpreterLabel.textContent,role==='interpreter'?'Interpreter · You':'Interpreter');
 assert.equal(elements.userLabel.textContent,role==='user'?'User · You':'User');
 assert.equal(elements.cameraButton['aria-label'],'Turn your camera off');
});
