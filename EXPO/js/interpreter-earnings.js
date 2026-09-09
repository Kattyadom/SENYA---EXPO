document.addEventListener('DOMContentLoaded', async () => {
 const status=document.getElementById('earningsStatus');
 if(!status)return;
 try {
  const account=await Senya.me('interpreter');
  await refresh();
  async function refresh(){
   const [sessions,requests]=await Promise.all([Senya.select('sessions'),Senya.select('service_requests')]);
   const completed=new Map(requests.filter(r=>r.status==='completed').map(r=>[r.id,r]));
   const monday=new Date();monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
   const rows=sessions.filter(s=>s.interpreter_id===account.id&&s.status==='completed'&&completed.has(s.request_id)).map(s=>{
    const start=Date.parse(s.started_at),end=Date.parse(s.ended_at);
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return null;
    const seconds=(end-start)/1000;
    return {end,seconds,cents:Math.max(200,Math.round(seconds*40/60)),service:completed.get(s.request_id).service};
   }).filter(Boolean).sort((a,b)=>b.end-a.end);
   const money=c=>'$'+(c/100).toFixed(2);
   document.getElementById('earningsTotal').textContent=money(rows.reduce((n,r)=>n+r.cents,0));
   document.getElementById('earningsWeek').textContent=money(rows.filter(r=>r.end>=monday.getTime()).reduce((n,r)=>n+r.cents,0));
   document.getElementById('earningsCount').textContent=String(rows.length);
   const history=document.getElementById('earningsHistory');history.replaceChildren();
   for(const row of rows.slice(0,10)){
    const item=document.createElement('p');item.className='earnings-row';
    item.textContent=row.service+' · '+new Date(row.end).toLocaleDateString()+' · '+(row.seconds/60).toFixed(1)+' min · '+money(row.cents);
    history.append(item);
   }
   status.textContent=rows.length?'Latest completed sessions':'No completed sessions with recorded time yet.';
  }
 }catch(e){status.textContent='Earnings could not be loaded. Please reload to try again.';}
});
