(function(root){
 function configureCallLayout(doc,role){
  const interpreter=role==='interpreter';
  const local=doc.getElementById('localVideo'),remote=doc.getElementById('remoteVideo');
  doc.querySelector('.main-video').prepend(interpreter?local:remote);
  doc.querySelector('.self-video').prepend(interpreter?remote:local);
  // Mute only the local preview, regardless of its size or position.
  local.muted=true;remote.muted=false;
  doc.getElementById('interpreterLabel').textContent=interpreter?'Interpreter · You':'Interpreter';
  doc.getElementById('userLabel').textContent=interpreter?'User':'User · You';
  doc.getElementById('cameraButton').title='Turn your camera off';
  doc.getElementById('cameraButton').setAttribute('aria-label','Turn your camera off');
  doc.getElementById('micButton').title='Mute your microphone';
  doc.getElementById('micButton').setAttribute('aria-label','Mute your microphone');
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=configureCallLayout;else root.configureCallLayout=configureCallLayout;
})(globalThis);
