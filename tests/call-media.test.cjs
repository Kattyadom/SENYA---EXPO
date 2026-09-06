const test=require('node:test');const assert=require('node:assert/strict');
const capture=require('../EXPO/js/call-media.js');
test('call uses tested video settings, then adds microphone',async()=>{
 const requests=[],tracks=[];const mic={kind:'audio'};const video={addTrack:t=>tracks.push(t)};
 const stream=await capture({getUserMedia:async c=>{requests.push(c);return requests.length===1?video:{getAudioTracks:()=>[mic]};}});
 assert.equal(stream,video);assert.deepEqual(requests,[{audio:false,video:{width:{ideal:640,max:640},height:{ideal:480,max:480},frameRate:{ideal:15,max:15}}},{video:false,audio:true}]);assert.deepEqual(tracks,[mic]);
});
test('microphone failure releases the camera',async()=>{
 let calls=0,stopped=false;const error=new Error('Microphone denied');
 await assert.rejects(capture({getUserMedia:async()=>{if(++calls===1)return {getTracks:()=>[{stop:()=>stopped=true}]};throw error;}}),error);
 assert.equal(stopped,true);
});
