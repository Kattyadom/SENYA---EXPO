(() => {
 const $=id=>document.getElementById(id),status=$('status'),details=$('details'),video=$('preview');
 let stream,context,frame,timer,generation=0;
 const info={secureContext:window.isSecureContext,mediaDevices:!!navigator.mediaDevices?.getUserMedia,browser:navigator.userAgent};
 const show=()=>details.textContent=JSON.stringify(info,null,2);show();
 function stop(){generation++;clearTimeout(timer);cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;video.onloadeddata=null;context?.close().catch(()=>{});context=null;$('level').value=0;$('testCamera').disabled=false;$('testMic').disabled=false;$('testCompatibility').disabled=false;}
 async function cameras(){try{const devices=await navigator.mediaDevices.enumerateDevices();const selected=$('camera').value;$('camera').replaceChildren(new Option('Default camera',''));devices.filter(d=>d.kind==='videoinput').forEach((d,i)=>$('camera').add(new Option(d.label||'Camera '+(i+1),d.deviceId)));$('camera').value=selected;info.cameraCount=devices.filter(d=>d.kind==='videoinput').length;show();}catch(e){info.deviceListError=e.name+': '+e.message;show();}}
 async function run(kind,compatibility=false){
 stop();const attempt=generation;$('testCamera').disabled=true;$('testMic').disabled=true;$('testCompatibility').disabled=true;status.textContent='Waiting for '+kind+' access…';delete info.error;info.test=compatibility?'camera compatibility':kind;info.selectedCamera=$('camera').selectedOptions[0]?.textContent;delete info.tracks;delete info.videoSize;info.result='Requesting access';show();
 timer=setTimeout(()=>{if(attempt===generation){stop();info.result='Timed out waiting for access';show();status.textContent='The device did not start within 25 seconds. Check the permission prompt, or try this page in Chrome or Edge.';}},25000);
 try{
 if(!navigator.mediaDevices?.getUserMedia)throw Error('Media capture is unavailable in this browser or context.');
 const cameraOptions={...($('camera').value?{deviceId:{exact:$('camera').value}}:{}),...(compatibility?{width:{ideal:640,max:640},height:{ideal:480,max:480},frameRate:{ideal:15,max:15}}:{})};
 const constraints=kind==='camera'?{audio:false,video:Object.keys(cameraOptions).length?cameraOptions:true}:{audio:true,video:false};
 info.stage='Opening device';show();
 const acquired=await navigator.mediaDevices.getUserMedia(constraints);
 if(attempt!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
 info.stage='Device opened; waiting for playback';stream=acquired;info.tracks=stream.getTracks().map(t=>({kind:t.kind,label:t.label,readyState:t.readyState,muted:t.muted}));
 if(kind==='camera'){
 video.onloadeddata=()=>{if(attempt!==generation||!video.videoWidth)return;clearTimeout(timer);info.stage='Receiving video';info.result='Video frames received';info.videoSize=video.videoWidth+' × '+video.videoHeight;show();status.textContent='Camera works: live video frames are visible below.';};
 video.srcObject=stream;await video.play();await cameras();
 }else{
 clearTimeout(timer);context=new AudioContext();await context.resume();if(attempt!==generation)return;
 const analyser=context.createAnalyser();analyser.fftSize=256;context.createMediaStreamSource(stream).connect(analyser);const samples=new Uint8Array(analyser.fftSize);
 const measure=()=>{if(attempt!==generation)return;analyser.getByteTimeDomainData(samples);$('level').value=Math.min(1,Math.sqrt(samples.reduce((sum,n)=>sum+((n-128)/128)**2,0)/samples.length)*4);frame=requestAnimationFrame(measure);};measure();info.result='Microphone stream opened';show();status.textContent='Microphone opened. Speak and check whether the level moves. Audio is not played back.';
 }
 }catch(e){if(attempt!==generation)return;stop();info.result='Failed';info.error=e.name+': '+e.message;show();status.textContent='The '+kind+' test failed. Share the Test details below. No call was started.';}
 }
 $('testCamera').onclick=()=>run('camera');$('testCompatibility').onclick=()=>run('camera',true);$('testMic').onclick=()=>run('microphone');$('stop').onclick=()=>{stop();status.textContent='Test stopped. Camera and microphone released.';};$('refresh').onclick=cameras;addEventListener('pagehide',stop);cameras();
})();
