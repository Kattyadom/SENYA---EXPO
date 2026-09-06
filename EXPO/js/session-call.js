document.addEventListener('DOMContentLoaded',async()=>{
 const id=new URLSearchParams(location.search).get('id');
 const localVideo=document.getElementById('localVideo'),remoteVideo=document.getElementById('remoteVideo'),placeholder=document.getElementById('remotePlaceholder');
 let stream,peer,socket,started,timer,pending=[],finishing=false,returnPage='appointments.html',isInterpreter=false;
 const notice=document.createElement('p');notice.setAttribute('role','status');notice.style.cssText='padding:14px;background:#fff;color:#1e293b;text-align:center';notice.textContent='Preparing your session…';(document.querySelector('main')||document.body).prepend(notice);
 const back=document.createElement('a');back.href=returnPage;back.textContent='Back to my appointments';back.style.cssText='display:inline-block;padding:12px 18px;margin:12px;border-radius:12px;background:#eff6ff;color:#1d4ed8;text-decoration:none';notice.after(back);
 const retry=document.createElement('button');retry.textContent='Retry camera';retry.hidden=true;retry.style.cssText=back.style.cssText;retry.onclick=()=>location.reload();back.after(retry);
 const check=document.createElement('a');check.href='camera-check.html';check.textContent='Check camera and microphone';check.style.cssText=back.style.cssText;retry.after(check);
 const say=t=>{notice.textContent=t;const connected=t==='Connected';const state=document.getElementById('callState');if(state)state.textContent=connected?'Call connected':t.startsWith('Waiting')?'Waiting for participant':'Not connected';const connectionState=document.getElementById('connectionState');if(connectionState)connectionState.textContent=connected?'Connected':'Not connected';};
 function closePeer(){peer?.close();peer=null;pending=[];remoteVideo.srcObject=null;if(placeholder&&!isInterpreter)placeholder.style.display='';}
 function cleanup(){closePeer();stream?.getTracks().forEach(t=>t.stop());clearInterval(timer);socket?.disconnect();}
 addEventListener('pagehide',cleanup,{once:true});
 let rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
 async function connection(){
 if(peer)return peer;
 peer=new RTCPeerConnection(rtcConfig);
 stream.getTracks().forEach(t=>peer.addTrack(t,stream));
 peer.onicecandidate=e=>{if(e.candidate)socket.emit('ice-candidate',e.candidate);};
 peer.ontrack=e=>{remoteVideo.srcObject=e.streams[0];if(placeholder)placeholder.style.display='none';say('Connected');if(!started){started=Date.now();timer=setInterval(()=>{const secs=Math.floor((Date.now()-started)/1000);const el=document.getElementById('callTimer');if(el)el.textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');},1000);}};
 peer.onconnectionstatechange=()=>{if(peer?.connectionState==='failed')say('Connection failed. Return to your appointment and join again.');};return peer;
 }
 async function flush(){while(pending.length)await peer.addIceCandidate(pending.shift());}
 const guard=fn=>async data=>{try{await fn(data);}catch(e){say('Could not connect: '+e.message);}};
 try{
 const account=await Senya.me();returnPage=account.role==='interpreter'?'interpreter-dashboard.html':'appointments.html';back.href=returnPage;if(!id)throw Error('Choose an accepted appointment before joining.');
 isInterpreter=account.role==='interpreter';configureCallLayout(document,account.role);
 const sessions=await Senya.select('sessions','&request_id=eq.'+encodeURIComponent(id));
 if(!sessions[0]||sessions[0].status==='completed')throw Error('This session is unavailable.');
 // The server starts the authorized session after media permission succeeds.
 stream=await captureCallMedia(navigator.mediaDevices);localVideo.srcObject=stream;
 if(isInterpreter&&placeholder)placeholder.style.display='none';
 window.dispatchEvent(new Event('senya-call-media-ready'));
 socket=io({autoConnect:false,reconnection:false,auth:{requestId:id,token:await Senya.token()}});
 socket.on('connect',()=>{say('Preparing the connection…');});
 socket.on('rtc-config',config=>{rtcConfig=config;say('Waiting for the other participant…');socket.emit('unirse-a-llamada');});
 socket.on('connect_error',e=>{cleanup();say(e.message);});
 socket.on('session-error',message=>{cleanup();say(message);});
 socket.on('session-ended',()=>{cleanup();say('This session has ended.');});
 socket.on('peer-left',()=>{closePeer();say('The other participant disconnected. Waiting for them to rejoin…');});
 socket.on('disconnect',()=>{closePeer();stream?.getTracks().forEach(t=>t.stop());clearInterval(timer);if(!finishing)say('Disconnected. Return to your appointment to reconnect.');});
 socket.on('crear-oferta',guard(async()=>{const p=await connection();await p.setLocalDescription(await p.createOffer());socket.emit('offer',p.localDescription);}));
 socket.on('offer',guard(async offer=>{const p=await connection();await p.setRemoteDescription(offer);await flush();await p.setLocalDescription(await p.createAnswer());socket.emit('answer',p.localDescription);}));
 socket.on('answer',guard(async answer=>{await peer.setRemoteDescription(answer);await flush();}));
 socket.on('ice-candidate',guard(async candidate=>{if(peer?.remoteDescription)await peer.addIceCandidate(candidate);else pending.push(candidate);}));
 socket.connect();
 }catch(e){cleanup();const messages={NotAllowedError:'Camera or microphone permission was denied. Allow access in your browser and try again.',NotFoundError:'No camera or microphone was found. Connect your device and try again.',NotReadableError:'Your camera or microphone is in use or unavailable. Close other apps and SENYA call tabs using it, then retry.',AbortError:'The camera could not start. Close other apps and SENYA call tabs using it, then retry.'};const timeout=/timeout starting video source/i.test(e.message||'');retry.hidden=!(messages[e.name]||timeout);say(messages[e.name]||(timeout?messages.AbortError:e.message+' Return to My appointments to try again.'));}
 for(const [id,kind] of [['micButton','audio'],['cameraButton','video']])document.getElementById(id)?.addEventListener('click',()=>{const t=stream?.getTracks().find(t=>t.kind===kind);if(t){t.enabled=!t.enabled;const button=document.getElementById(id);button.setAttribute('aria-pressed',String(!t.enabled));button.style.background=t.enabled?'#ecf5ff':'#f6639a';}});
 document.getElementById('endCallButton')?.addEventListener('click',async()=>{
 if(finishing)return;finishing=true;
 try{await Senya.rpc('respond_request',{p_id:id,p_action:'finish'});cleanup();location.href=returnPage;}catch(e){cleanup();say('Your camera is off. Could not finish the appointment: '+e.message);finishing=false;}
 });
});
