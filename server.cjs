const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server,{maxHttpBufferSize:100000});
const url=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
app.get('/healthz',(_,res)=>res.json({status:'ok'}));
app.get('/api/config',(_,res)=>url&&key?res.json({url,key}):res.status(503).json({error:'Supabase is not configured'}));
app.get('/',(_,res)=>res.sendFile(path.join(__dirname,'EXPO','index.html')));
app.use((req,res,next)=>{if(req.path==='/server.js')return res.sendStatus(404);next();});
app.use(express.static(path.join(__dirname,'EXPO'),{dotfiles:'deny'}));
async function remote(route,token,body) {
 if(!url||!key)throw Error('Database not configured');
 let res;
 try { res=await fetch(url+route,{method:body?'POST':'GET',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)}); }
 catch {const error=Error('The call server cannot reach SENYA. Please try again shortly.');error.code='upstream_unreachable';throw error;}
 if(!res.ok)throw Error('Session unavailable');
 return res.json().catch(()=>null);
}
io.use(async(socket,next)=>{
 try{
  const {token,requestId}=socket.handshake.auth||{};
  if(typeof token!=='string'||! /^[0-9a-f-]{36}$/i.test(requestId||''))throw Error('Sign in required');
  const user=await remote('/auth/v1/user',token);
  const rows=await remote('/rest/v1/sessions?select=*&request_id=eq.'+requestId,token);
  const s=rows[0]; if(!s||s.status==='completed'||![s.user_id,s.interpreter_id].includes(user.id))throw Error('Session unavailable');
  await remote('/rest/v1/rpc/respond_request',token,{p_id:requestId,p_action:'start'});
  socket.data={token,requestId,userId:user.id,room:s.id};next();
 }catch(error){next(Error(error.code==='upstream_unreachable'?error.message:'This session is unavailable. Return to your appointments.'));}
});
io.on('connection',socket=>{
 const iceServers=[{urls:'stun:stun.l.google.com:19302'}];
 if(process.env.TURN_URLS&&process.env.TURN_USERNAME&&process.env.TURN_CREDENTIAL){
  iceServers.push({urls:process.env.TURN_URLS.split(',').map(value=>value.trim()).filter(Boolean),username:process.env.TURN_USERNAME,credential:process.env.TURN_CREDENTIAL});
 }
 socket.emit('rtc-config',{iceServers,iceTransportPolicy:process.env.TURN_FORCE_RELAY==='true'&&iceServers.length>1?'relay':'all'});
 socket.on('unirse-a-llamada',()=>{
  const room=socket.data.room;
  const members=[...(io.sockets.adapter.rooms.get(room)||[])];
  if(members.includes(socket.id))return;
  if(members.length>=2||members.some(id=>io.sockets.sockets.get(id)?.data.userId===socket.data.userId)){socket.emit('session-error','This account is already connected.');socket.disconnect();return;}
  socket.join(room);if(members.length===1)io.to(members[0]).emit('crear-oferta');
 });
 for(const event of ['offer','answer','ice-candidate'])socket.on(event,payload=>{if(socket.rooms.has(socket.data.room))socket.to(socket.data.room).emit(event,payload);});
 let checking=false;
 const timer=setInterval(async()=>{if(checking)return;checking=true;try{const rows=await remote('/rest/v1/sessions?select=status&request_id=eq.'+socket.data.requestId,socket.data.token);if(!rows[0]||rows[0].status==='completed'){socket.emit('session-ended');socket.disconnect();}}catch(error){socket.emit('session-error',error.code==='upstream_unreachable'?'The call server lost its connection to SENYA. Return to your appointment and join again.':'Your session could not be verified. Sign in again.');socket.disconnect();}finally{checking=false;}},5000);
 socket.on('disconnect',()=>{clearInterval(timer);socket.to(socket.data.room).emit('peer-left');});
});
const PORT=process.env.PORT||3000;
if(require.main===module)server.listen(PORT,()=>console.log(`SENYA: http://localhost:${PORT}`));
module.exports={app,server};
