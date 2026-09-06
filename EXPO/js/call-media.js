/* Start video with the settings validated by the camera compatibility check. */
(function(root){
 async function captureCallMedia(devices){
  const video=await devices.getUserMedia({audio:false,video:{width:{ideal:640,max:640},height:{ideal:480,max:480},frameRate:{ideal:15,max:15}}});
  try{
   const audio=await devices.getUserMedia({video:false,audio:true});
   audio.getAudioTracks().forEach(track=>video.addTrack(track));
   return video;
  }catch(error){video.getTracks().forEach(track=>track.stop());throw error;}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=captureCallMedia;
 else root.captureCallMedia=captureCallMedia;
})(globalThis);
